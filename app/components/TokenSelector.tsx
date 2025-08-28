'use client';

import { useState, useEffect, useMemo } from 'react';
import { Token, TokenSelectDropdown } from '@coinbase/onchainkit/token';
import { useAccount, useBalance, useChainId, useReadContracts } from 'wagmi';
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
  
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [customTokenError, setCustomTokenError] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
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
    setIsAddingCustom(false);
  };

  const handleCustomTokenAdd = async () => {
    if (!isAddress(customTokenAddress)) {
      setCustomTokenError('Invalid token address');
      return;
    }

    if (!address) {
      setCustomTokenError('Please connect your wallet first');
      return;
    }

    setCustomTokenError('');
    setIsAddingCustom(true);
    
    try {
      // Try to fetch token information
      const token = await fetchTokenByAddress(customTokenAddress, chainId);
      
      if (token) {
        // Add to available tokens list if not already there
        if (!availableTokens.find(t => t.address.toLowerCase() === token.address.toLowerCase())) {
          setAvailableTokens(prev => [...prev, token]);
        }
        handleTokenSelect(token);
        setCustomTokenAddress('');
        setCustomTokenError('');
      } else {
        // Create a minimal token object if not found
        const minimalToken: Token = {
          address: customTokenAddress as `0x${string}`,
          chainId: chainId,
          name: 'Custom Token',
          symbol: 'CUSTOM',
          decimals: 18,
          image: null,
        };
        
        // Add to available tokens list
        setAvailableTokens(prev => [...prev, minimalToken]);
        handleTokenSelect(minimalToken);
        setCustomTokenAddress('');
        setCustomTokenError('');
      }
    } catch (error) {
      console.error('Error adding custom token:', error);
      setCustomTokenError('Failed to add token');
    } finally {
      setIsAddingCustom(false);
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
        {!isAddingCustom ? (
          <button
            onClick={() => setIsAddingCustom(true)}
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
            />
            {customTokenError && (
              <p className="text-xs text-error">{customTokenError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCustomTokenAdd}
                disabled={!customTokenAddress}
                className="flex-1 px-3 py-1.5 bg-base-blue text-white rounded-lg hover:bg-base-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                Add Token
              </button>
              <button
                onClick={() => {
                  setIsAddingCustom(false);
                  setCustomTokenAddress('');
                  setCustomTokenError('');
                }}
                className="flex-1 px-3 py-1.5 bg-background-tertiary text-foreground rounded-lg hover:bg-border text-sm font-medium transition-colors"
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