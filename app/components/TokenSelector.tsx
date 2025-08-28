'use client';

import { useState, useEffect, useMemo } from 'react';
import { Token, TokenSelectDropdown } from '@coinbase/onchainkit/token';
import { useAccount, useBalance, useChainId, useReadContracts, usePublicClient } from 'wagmi';
import { formatUnits, isAddress, erc20Abi } from 'viem';
import { 
  getDefaultTokens,
  getTokensForChain,
  fetchTokenByAddress,
  clearTokenCache
} from '@/app/lib/tokenService';
import { formatTokenBalance } from '@/app/utils/formatBalance';

interface TokenSelectorProps {
  onTokenSelect: (token: Token) => void;
  selectedToken: Token | null;
}

export default function TokenSelector({ onTokenSelect, selectedToken }: TokenSelectorProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customTokenError, setCustomTokenError] = useState('');
  const [showCustomTokenInput, setShowCustomTokenInput] = useState(false);
  const [isAddingCustomToken, setIsAddingCustomToken] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: tokenBalance } = useBalance({
    address: address,
    token: selectedToken?.address as `0x${string}` | undefined,
  });

  // Load tokens based on chain
  useEffect(() => {
    const loadTokensAsync = async () => {
      if (!chainId) return;

      setIsLoadingTokens(true);
      
      try {
        const tokens = await getTokensForChain(chainId);
        // Filter out native ETH if it appears in the list (address is 0x0)
        const filteredTokens = tokens.filter(token => 
          token.address && 
          token.address !== '0x0000000000000000000000000000000000000000' &&
          token.symbol !== 'ETH'
        );
        setAllTokens(filteredTokens);
      } catch (error) {
        console.error('Failed to load tokens:', error);
        // Use fallback tokens
        const fallbackTokens = getDefaultTokens(chainId);
        const filteredFallback = fallbackTokens.filter(token => 
          token.address && 
          token.address !== '0x0000000000000000000000000000000000000000' &&
          token.symbol !== 'ETH'
        );
        setAllTokens(filteredFallback);
      } finally {
        setIsLoadingTokens(false);
      }
    };
    
    loadTokensAsync();
  }, [chainId]);

  // Prepare balance check contracts
  const balanceContracts = useMemo(() => {
    if (!address || !allTokens.length) return [];
    
    return allTokens.map(token => ({
      address: token.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    }));
  }, [address, allTokens]);

  // Fetch all token balances in parallel
  const { data: balanceData, isLoading: isLoadingBalances } = useReadContracts({
    contracts: balanceContracts,
    query: {
      enabled: !!address && balanceContracts.length > 0,
    },
  });

  // Filter tokens based on balance > 0
  useEffect(() => {
    if (!address) {
      // If wallet not connected, show a limited set of popular tokens
      setAvailableTokens(allTokens.slice(0, 5));
      return;
    }

    if (!balanceData || isLoadingBalances) {
      setAvailableTokens([]);
      return;
    }

    // Filter tokens that have balance > 0
    const tokensWithBalance = allTokens.filter((token, index) => {
      const balanceResult = balanceData[index];
      if (balanceResult?.status === 'success' && balanceResult.result) {
        const balance = balanceResult.result as bigint;
        return balance > BigInt(0);
      }
      return false;
    });

    // If no tokens with balance, show WETH as a default option to guide users
    if (tokensWithBalance.length === 0) {
      const wethToken = allTokens.find(t => t.symbol === 'WETH');
      if (wethToken) {
        setAvailableTokens([wethToken]);
      } else {
        setAvailableTokens([]);
      }
    } else {
      setAvailableTokens(tokensWithBalance);
    }
  }, [address, allTokens, balanceData, isLoadingBalances]);

  // Clear cache when network changes
  useEffect(() => {
    clearTokenCache();
    setAllTokens([]);
    setAvailableTokens([]);
  }, [chainId]);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setShowCustomTokenInput(false);
    setCustomTokenAddress('');
    setCustomTokenError('');
  };

  const handleCustomTokenAdd = async () => {
    console.log('[TokenSelector] Starting custom token add:', customTokenAddress);
    
    if (!isAddress(customTokenAddress)) {
      setCustomTokenError('Invalid token address');
      return;
    }

    if (!address) {
      setCustomTokenError('Please connect your wallet first');
      return;
    }

    setCustomTokenError('');
    setIsAddingCustomToken(true);
    
    const tokenAddress = customTokenAddress as `0x${string}`;
    
    // Create a minimal token immediately - this always works
    let token: Token = {
      address: tokenAddress,
      chainId: chainId,
      name: 'Custom Token',
      symbol: 'TOKEN',
      decimals: 18,
      image: null,
    };
    
    try {
      console.log('[TokenSelector] Created minimal token, attempting to enrich...');
      
      // Try to fetch better data, but with aggressive timeouts and fallbacks
      // This is a "best effort" - if it fails, we still have a working token
      
      // First, try the API with a short timeout (2 seconds)
      const apiPromise = fetchTokenByAddress(customTokenAddress, chainId);
      const apiTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
      
      const apiToken = await Promise.race([apiPromise, apiTimeout]);
      
      if (apiToken) {
        console.log('[TokenSelector] API provided token data:', apiToken);
        token = apiToken;
      } else {
        console.log('[TokenSelector] API timeout or no data, attempting blockchain enrichment');
        
        // Only try blockchain reads on desktop (not in Coinbase app)
        // Detect Coinbase app by checking if we're in a WebView with limited features
        const isCoinbaseApp = /CoinbaseWallet/i.test(navigator.userAgent) || 
                             (window.ethereum && 'isCoinbaseWallet' in window.ethereum);
        
        if (!isCoinbaseApp && publicClient) {
          // Try to get just the symbol with very short timeout (1 second)
          try {
            const symbolPromise = publicClient.readContract({
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'symbol',
            }) as Promise<string>;
            
            const symbolTimeout = new Promise<string>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 1000)
            );
            
            const symbol = await Promise.race([symbolPromise, symbolTimeout]).catch(() => null);
            
            if (symbol && typeof symbol === 'string') {
              token.symbol = symbol;
              console.log('[TokenSelector] Got symbol from blockchain:', symbol);
            }
            
            // Try decimals with very short timeout
            const decimalsPromise = publicClient.readContract({
              address: tokenAddress,
              abi: erc20Abi,
              functionName: 'decimals',
            }) as Promise<number>;
            
            const decimalsTimeout = new Promise<number>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 1000)
            );
            
            const decimals = await Promise.race([decimalsPromise, decimalsTimeout]).catch(() => null);
            
            if (decimals && typeof decimals === 'number') {
              token.decimals = decimals;
              console.log('[TokenSelector] Got decimals from blockchain:', decimals);
            }
          } catch (err) {
            console.warn('[TokenSelector] Blockchain read failed, using defaults:', err);
          }
        } else {
          console.log('[TokenSelector] Skipping blockchain reads (Coinbase app detected or no client)');
        }
      }
      
      console.log('[TokenSelector] Final token object:', token);
      
      // Add to available tokens list if not already there
      if (!availableTokens.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
        setAvailableTokens(prev => [...prev, token]);
        console.log('[TokenSelector] Added token to available list');
      }
      
      // Select the token
      handleTokenSelect(token);
      setCustomTokenAddress('');
      setCustomTokenError('');
      console.log('[TokenSelector] Token selection complete');
      
    } catch (error) {
      console.error('[TokenSelector] Unexpected error:', error);
      // Even if something fails, we still add the minimal token
      if (!availableTokens.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
        setAvailableTokens(prev => [...prev, token]);
      }
      handleTokenSelect(token);
      setCustomTokenAddress('');
      setCustomTokenError('');
    } finally {
      setIsAddingCustomToken(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground-secondary">
        Select Token to Lock
      </label>
      
      {/* OnchainKit TokenSelectDropdown */}
      <div className="token-selector-wrapper">
        {isLoadingTokens || isLoadingBalances ? (
          <div className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-center text-foreground-tertiary">
            {isLoadingTokens ? 'Loading tokens...' : 'Checking balances...'}
          </div>
        ) : availableTokens.length === 0 && address ? (
          <div className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-center">
            <p className="text-foreground-secondary text-sm">
              No tokens with balance found.
            </p>
            <p className="text-foreground-tertiary text-xs mt-1">
              Get WETH by wrapping ETH or acquire other tokens first.
            </p>
          </div>
        ) : (
          <TokenSelectDropdown
            token={selectedToken || undefined}
            setToken={handleTokenSelect}
            options={availableTokens}
          />
        )}
      </div>

      {/* Custom Token Addition */}
      <div className="border-t border-border pt-4">
        {!showCustomTokenInput ? (
          <button
            onClick={() => setShowCustomTokenInput(true)}
            className="w-full text-sm text-base-blue hover:text-base-blue-light font-medium transition-colors"
          >
            + Add Custom Token by Address
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Token contract address (0x...)"
              value={customTokenAddress}
              onChange={(e) => {
                setCustomTokenAddress(e.target.value);
                setCustomTokenError('');
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-base-blue/50 focus:border-base-blue text-sm"
              autoFocus
              disabled={isAddingCustomToken}
            />
            {customTokenError && (
              <p className="text-xs text-error">{customTokenError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCustomTokenAdd}
                disabled={!customTokenAddress || isAddingCustomToken}
                className="flex-1 px-3 py-1.5 bg-base-blue text-white rounded-lg hover:bg-base-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isAddingCustomToken ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Add Token'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCustomTokenInput(false);
                  setCustomTokenAddress('');
                  setCustomTokenError('');
                }}
                disabled={isAddingCustomToken}
                className="flex-1 px-3 py-1.5 bg-background-tertiary text-foreground rounded-lg hover:bg-border text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Token Balance Display */}
      {mounted && selectedToken && address && tokenBalance && (
        <div className="bg-background-secondary p-3 rounded-lg border border-border animate-fade-in">
          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground-secondary">Your Balance:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {formatTokenBalance(formatUnits(tokenBalance.value, tokenBalance.decimals))}
              </span>
              <span className="text-foreground-secondary">{selectedToken.symbol}</span>
            </div>
          </div>
        </div>
      )}

      {mounted && !address && (
        <div className="text-sm text-foreground-tertiary text-center p-3 bg-background-secondary rounded-lg border border-border">
          Connect your wallet to see tokens with balance
        </div>
      )}

      {mounted && address && availableTokens.length > 0 && (
        <div className="text-xs text-foreground-tertiary text-center">
          Showing only ERC-20 tokens with balance &gt; 0
        </div>
      )}

      {/* Custom styles for OnchainKit components */}
      <style jsx global>{`
        .token-selector-wrapper .ock-token-select-dropdown {
          width: 100%;
        }
        
        .token-selector-wrapper .ock-token-select-dropdown button {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--background-secondary);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        
        .token-selector-wrapper .ock-token-select-dropdown button:hover {
          background: var(--background-tertiary);
          border-color: var(--border-strong);
        }
        
        .token-selector-wrapper .ock-token-select-dropdown-list {
          background: var(--background-secondary);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-height: 24rem;
          overflow-y: auto;
        }
        
        .token-selector-wrapper .ock-token-row {
          padding: 0.75rem 1rem;
          transition: background 0.2s;
        }
        
        .token-selector-wrapper .ock-token-row:hover {
          background: var(--background-tertiary);
        }
        
        .token-selector-wrapper .ock-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        
        .token-selector-wrapper .ock-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .token-selector-wrapper .ock-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .token-selector-wrapper .ock-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 4px;
        }
        
        .token-selector-wrapper .ock-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--border-strong);
        }
      `}</style>
    </div>
  );
}