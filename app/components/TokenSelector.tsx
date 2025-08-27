'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Token, TokenImage } from '@coinbase/onchainkit/token';
import { useAccount, useBalance, useReadContracts, useChainId } from 'wagmi';
import { formatUnits, parseAbi, isAddress } from 'viem';
import { baseSepolia } from 'viem/chains';
import { 
  KNOWN_BASE_SEPOLIA_TOKENS, 
  fetchPopularTokens,
  searchTokens,
  fetchTokenByAddress,
  clearTokenCache
} from '@/app/lib/tokenService';
import { formatTokenBalance } from '@/app/utils/formatBalance';

interface TokenSelectorProps {
  onTokenSelect: (token: Token) => void;
  selectedToken: Token | null;
}

// ERC-20 ABI for token metadata
const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
]);

export default function TokenSelector({ onTokenSelect, selectedToken }: TokenSelectorProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  
  const [walletTokens, setWalletTokens] = useState<Token[]>([]);
  const [popularTokens, setPopularTokens] = useState<Token[]>([]);
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTokenError, setCustomTokenError] = useState('');
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { data: tokenBalance } = useBalance({
    address: address,
    token: selectedToken?.address as `0x${string}` | undefined,
  });

  // Fetch custom token metadata
  const { refetch: refetchCustomToken } = useReadContracts({
    contracts: customTokenAddress && isAddress(customTokenAddress) ? [
      {
        address: customTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
      {
        address: customTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
      },
      {
        address: customTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      },
      {
        address: customTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
    ] : [],
  });

  // Load popular tokens when dropdown opens
  useEffect(() => {
    if (dropdownOpen && chainId && address) {
      loadTokens();
    }
  }, [dropdownOpen, chainId, address]);

  // Clear cache when network changes
  useEffect(() => {
    clearTokenCache();
    setWalletTokens([]);
    setPopularTokens([]);
    setSearchResults([]);
  }, [chainId]);

  const loadTokens = async () => {
    if (!chainId) return;

    setIsLoadingTokens(true);
    
    try {
      if (chainId === baseSepolia.id) {
        // For Base Sepolia, use the hardcoded list
        const tokens = Object.values(KNOWN_BASE_SEPOLIA_TOKENS);
        setWalletTokens(tokens);
      } else {
        // For Base mainnet, fetch popular tokens from API
        const tokens = await fetchPopularTokens();
        setPopularTokens(tokens);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // Debounced search function using useRef for stability
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const searchTokensDebounced = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchTokens(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchTokensDebounced(value);
  };

  const handleCustomTokenAdd = async () => {
    if (!isAddress(customTokenAddress)) {
      setCustomTokenError('Invalid token address');
      return;
    }

    setCustomTokenError('Fetching token information...');
    
    try {
      // First try to fetch from OnchainKit API
      const apiToken = await fetchTokenByAddress(customTokenAddress);
      
      if (apiToken) {
        // Check if user has balance
        const result = await refetchCustomToken();
        if (result.data && result.data[0]?.status === 'success') {
          const balanceValue = result.data[0].result as bigint;
          
          // Add to wallet tokens even if balance is 0
          handleTokenSelect(apiToken);
          setCustomTokenAddress('');
          setIsAddingCustom(false);
          setCustomTokenError('');
          
          if (balanceValue === BigInt(0)) {
            console.log('Warning: You have no balance of this token');
          }
        } else {
          setCustomTokenError('Failed to fetch token balance');
        }
      } else {
        // Fallback to contract read if API doesn't have the token
        const result = await refetchCustomToken();
        
        if (!result.data || result.data.length === 0) {
          setCustomTokenError('Failed to fetch token information');
          return;
        }
        
        const [, name, symbol, decimals] = result.data;
        
        if (
          name?.status === 'success' &&
          symbol?.status === 'success' &&
          decimals?.status === 'success'
        ) {
          const newToken: Token = {
            address: customTokenAddress as `0x${string}`,
            chainId: chainId,
            name: name.result as string,
            symbol: symbol.result as string,
            decimals: Number(decimals.result),
            image: null,
          };

          handleTokenSelect(newToken);
          setCustomTokenAddress('');
          setIsAddingCustom(false);
          setCustomTokenError('');
        } else {
          const errors = [];
          if (name?.status !== 'success') errors.push('name');
          if (symbol?.status !== 'success') errors.push('symbol');
          if (decimals?.status !== 'success') errors.push('decimals');
          setCustomTokenError(`Failed to fetch token data: ${errors.join(', ')}`);
        }
      }
    } catch (error) {
      console.error('Error adding custom token:', error);
      setCustomTokenError('Failed to add token');
    }
  };

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setDropdownOpen(false);
    setIsAddingCustom(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Get tokens to display
  const getDisplayTokens = () => {
    if (searchQuery && searchResults.length > 0) {
      return searchResults;
    }
    
    if (chainId === baseSepolia.id) {
      return walletTokens;
    }
    
    return popularTokens;
  };

  const displayTokens = getDisplayTokens();

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground-secondary">
        Select Token to Lock
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full touch-target px-4 py-3 bg-background-secondary border border-border rounded-lg hover:bg-background-tertiary hover:border-border-strong transition-all focus-ring flex items-center justify-between"
          aria-label="Select token"
          aria-expanded={dropdownOpen}
        >
          {selectedToken ? (
            <div className="flex items-center gap-3">
              <TokenImage token={selectedToken} size={32} />
              <div className="text-left">
                <div className="font-medium text-foreground">{selectedToken.symbol}</div>
                <div className="text-xs text-foreground-tertiary">{selectedToken.name}</div>
              </div>
            </div>
          ) : (
            <span className="text-foreground-tertiary">Select a token</span>
          )}
          <svg 
            className={`w-5 h-5 text-foreground-tertiary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-background-secondary border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto custom-scrollbar">
            {/* Search Bar */}
            {chainId !== baseSepolia.id && (
              <div className="sticky top-0 bg-background-secondary border-b border-border p-3">
                <input
                  type="text"
                  placeholder="Search by name, symbol, or address..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-base-blue/50 focus:border-base-blue text-sm"
                  autoFocus
                />
                {isSearching && (
                  <div className="mt-2 text-xs text-foreground-tertiary">Searching...</div>
                )}
              </div>
            )}

            {/* Token List */}
            {isLoadingTokens ? (
              <div className="p-4 text-center text-foreground-tertiary">
                Loading tokens...
              </div>
            ) : displayTokens.length === 0 ? (
              <div className="p-4 text-center text-foreground-tertiary">
                {searchQuery 
                  ? 'No tokens found. Try a different search.'
                  : address 
                    ? 'No tokens available'
                    : 'Connect wallet to see tokens'
                }
              </div>
            ) : (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-foreground-tertiary uppercase tracking-wider">
                  {searchQuery ? 'Search Results' : chainId === baseSepolia.id ? 'Available Tokens' : 'Popular Tokens'}
                </div>
                {displayTokens.map((token) => {
                  const isSelected = selectedToken?.address.toLowerCase() === token.address.toLowerCase();
                  const isVerified = chainId === baseSepolia.id 
                    ? KNOWN_BASE_SEPOLIA_TOKENS[token.address.toLowerCase()] !== undefined
                    : true; // All API tokens are verified
                  
                  return (
                    <button
                      key={token.address}
                      onClick={() => handleTokenSelect(token)}
                      className={`w-full px-4 py-3 hover:bg-background-tertiary transition-colors flex items-center gap-3 ${
                        isSelected ? 'bg-base-blue/10' : ''
                      }`}
                    >
                      <TokenImage token={token} size={32} />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{token.symbol}</span>
                          {isVerified && (
                            <span className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded-full font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-foreground-tertiary">{token.name}</div>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-base-blue" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Add Custom Token */}
            <div className="border-t border-border p-4">
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
          </div>
        )}
      </div>

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
    </div>
  );
}