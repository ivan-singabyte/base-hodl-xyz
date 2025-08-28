/**
 * Token Service - Fetches token metadata dynamically using OnchainKit API
 */

import { Token } from '@coinbase/onchainkit/token';
import { getTokens } from '@coinbase/onchainkit/api';
import { base, baseSepolia } from 'viem/chains';

// Cache for token metadata
const tokenCache = new Map<string, Token[]>();
const singleTokenCache = new Map<string, Token>();

// Popular Base mainnet tokens to show by default
export const POPULAR_BASE_TOKENS: Token[] = [
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    chainId: base.id,
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
  },
  {
    address: '0x4200000000000000000000000000000000000006',
    chainId: base.id,
    decimals: 18,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    image: 'https://ethereum-optimism.github.io/logos/WETH.svg',
  },
  {
    address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
    chainId: base.id,
    decimals: 18,
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/d0/d7/d0d7784975771dbbac9a22c8c0c12928cc6f658cbcf2bbbf7c909f0fa2426dec-NmU4ZWViMDItOTQyYy00Yjk5LTkzODUtNGJlZmJiMTUxOTgy',
  },
];

// Known Base Sepolia testnet tokens (as array for dropdown)
export const KNOWN_BASE_SEPOLIA_TOKENS: Token[] = [
  {
    address: '0x4200000000000000000000000000000000000006',
    chainId: baseSepolia.id,
    decimals: 18,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    image: 'https://ethereum-optimism.github.io/logos/WETH.svg',
  },
  {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    chainId: baseSepolia.id,
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    image: 'https://ethereum-optimism.github.io/logos/USDC.svg',
  },
  {
    address: '0x808456652fdb597867f38412077A9182bf77359F',
    chainId: baseSepolia.id,
    decimals: 6,
    name: 'Euro Coin',
    symbol: 'EURC',
    image: null,
  },
];

// Known Base Sepolia testnet tokens (as map for quick lookup)
export const KNOWN_BASE_SEPOLIA_TOKENS_MAP: Record<string, Token> = {
  '0x4200000000000000000000000000000000000006': KNOWN_BASE_SEPOLIA_TOKENS[0],
  '0x036cbd53842c5426634e7929541ec2318f3dcf7e': KNOWN_BASE_SEPOLIA_TOKENS[1],
  '0x808456652fdb597867f38412077a9182bf77359f': KNOWN_BASE_SEPOLIA_TOKENS[2],
};

/**
 * Get default tokens based on chain
 */
export function getDefaultTokens(chainId: number): Token[] {
  if (chainId === baseSepolia.id) {
    return KNOWN_BASE_SEPOLIA_TOKENS;
  }
  return POPULAR_BASE_TOKENS;
}

/**
 * Fetch popular tokens for Base mainnet using OnchainKit API
 */
export async function fetchPopularTokens(limit: number = 50): Promise<Token[]> {
  const cacheKey = `popular_base_tokens_${limit}`;
  
  // Check cache first
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey)!;
  }

  try {
    // Fetch tokens from OnchainKit API
    const result = await getTokens({ 
      limit: limit.toString()
    });
    
    if (Array.isArray(result) && result.length > 0) {
      const tokens = result.map(token => ({
        ...token,
        chainId: base.id,
      }));
      
      // Cache the results
      tokenCache.set(cacheKey, tokens);
      return tokens;
    }
    
    // Fallback to hardcoded popular tokens
    return POPULAR_BASE_TOKENS;
  } catch (error) {
    console.error('Failed to fetch popular tokens:', error);
    // Return fallback tokens on error
    return POPULAR_BASE_TOKENS;
  }
}

/**
 * Search for tokens by name, symbol, or address
 */
export async function searchTokens(query: string, limit: number = 20): Promise<Token[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const cacheKey = `search_${query}_${limit}`;
  
  // Check cache first
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey)!;
  }

  try {
    const result = await getTokens({ 
      limit: limit.toString(), 
      search: query 
    });
    
    if (Array.isArray(result) && result.length > 0) {
      const tokens = result.map(token => ({
        ...token,
        chainId: base.id,
      }));
      
      // Cache the results for 5 minutes
      tokenCache.set(cacheKey, tokens);
      setTimeout(() => tokenCache.delete(cacheKey), 5 * 60 * 1000);
      
      return tokens;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to search tokens:', error);
    return [];
  }
}

/**
 * Fetch a specific token by address
 */
export async function fetchTokenByAddress(address: string, chainId: number = base.id): Promise<Token | null> {
  const normalizedAddress = address.toLowerCase();
  const cacheKey = `${chainId}_${normalizedAddress}`;
  
  // Check single token cache
  if (singleTokenCache.has(cacheKey)) {
    return singleTokenCache.get(cacheKey)!;
  }

  // For testnet, check hardcoded list first
  if (chainId === baseSepolia.id) {
    const testnetToken = KNOWN_BASE_SEPOLIA_TOKENS.find(
      t => t.address.toLowerCase() === normalizedAddress
    );
    if (testnetToken) {
      singleTokenCache.set(cacheKey, testnetToken);
      return testnetToken;
    }
    // If not in known list, return null (don't try API for testnet)
    return null;
  }

  // For mainnet, first check popular tokens
  const popularToken = POPULAR_BASE_TOKENS.find(
    t => t.address.toLowerCase() === normalizedAddress
  );
  if (popularToken) {
    singleTokenCache.set(cacheKey, popularToken);
    return popularToken;
  }

  try {
    // Try to fetch from API (only works for mainnet)
    if (chainId === base.id) {
      const result = await getTokens({ 
        limit: '5', 
        search: address 
      });
      
      if (Array.isArray(result) && result.length > 0) {
        // Find exact match by address
        const exactMatch = result.find(
          t => t.address.toLowerCase() === normalizedAddress
        );
        
        if (exactMatch) {
          const token = {
            ...exactMatch,
            chainId: chainId,
          };
          singleTokenCache.set(cacheKey, token);
          return token;
        }
        
        // If no exact match, use first result
        const token = {
          ...result[0],
          chainId: chainId,
        };
        singleTokenCache.set(cacheKey, token);
        return token;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch token ${address}:`, error);
    return null;
  }
}

/**
 * Get tokens for dropdown based on chain
 */
export async function getTokensForChain(chainId: number, searchQuery?: string): Promise<Token[]> {
  // If there's a search query, use search
  if (searchQuery && searchQuery.length >= 2) {
    // For testnet, filter hardcoded list
    if (chainId === baseSepolia.id) {
      const query = searchQuery.toLowerCase();
      return KNOWN_BASE_SEPOLIA_TOKENS.filter(
        token => 
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.address.toLowerCase().includes(query)
      );
    }
    // For mainnet, use API search
    return searchTokens(searchQuery);
  }
  
  // No search query - return default tokens
  if (chainId === baseSepolia.id) {
    return KNOWN_BASE_SEPOLIA_TOKENS;
  }
  
  // For mainnet, fetch popular tokens
  return fetchPopularTokens();
}

/**
 * Get token image URL with fallback
 */
export function getTokenImageUrl(token: Token | null): string {
  if (!token) {
    return '/token-placeholder.png';
  }
  
  if (token.image) {
    return token.image;
  }
  
  // Generate a fallback image based on the symbol
  return `https://ui-avatars.com/api/?name=${token.symbol}&background=0052FF&color=fff&size=128`;
}

/**
 * Clear token cache (useful when switching networks)
 */
export function clearTokenCache(): void {
  tokenCache.clear();
  singleTokenCache.clear();
}