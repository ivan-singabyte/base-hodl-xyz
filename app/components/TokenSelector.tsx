'use client';

import { useState, useEffect } from 'react';
import { Token, TokenSelectDropdown } from '@coinbase/onchainkit/token';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatUnits, isAddress } from 'viem';
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
        setAvailableTokens(tokens);
      } catch (error) {
        console.error('Failed to load tokens:', error);
        // Use fallback tokens
        setAvailableTokens(getDefaultTokens(chainId));
      } finally {
        setIsLoadingTokens(false);
      }
    };
    
    loadTokensAsync();
  }, [chainId]);

  // Clear cache when network changes
  useEffect(() => {
    clearTokenCache();
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

    setCustomTokenError('');
    setIsAddingCustom(true);
    
    try {
      // Try to fetch token information
      const token = await fetchTokenByAddress(customTokenAddress, chainId);
      
      if (token) {
        handleTokenSelect(token);
        setCustomTokenAddress('');
        setCustomTokenError('');
      } else {
        // Create a minimal token object if not found
        const minimalToken: Token = {
          address: customTokenAddress as `0x${string}`,
          chainId: chainId,
          name: 'Unknown Token',
          symbol: 'UNKNOWN',
          decimals: 18,
          image: null,
        };
        
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
        {isLoadingTokens ? (
          <div className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-center text-foreground-tertiary">
            Loading tokens...
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
          Connect your wallet to see available tokens
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