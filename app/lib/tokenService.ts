/**
 * Token Service - Fetches token metadata dynamically using OnchainKit API
 */

import { Token } from '@coinbase/onchainkit/token';
import { getTokens } from '@coinbase/onchainkit/api';
import { base, baseSepolia } from 'viem/chains';

// Cache for token metadata
const tokenCache = new Map<string, Token[]>();
const singleTokenCache = new Map<string, Token>();

// Popular tokens to show by default (symbols)
const POPULAR_BASE_TOKENS = [
  'USDC',
  'WETH', 
  'DAI',
  'AERO',
  'cbETH',
  'wstETH',
  'USDS',
  'USDe',
  'cbBTC',
  'WBTC',
  'rETH',
  'MORPHO',
  'VIRTUAL',
  'EIGEN',
  'ENA',
  'PENDLE',
  'PRIME',
  'LINK',
  'COMP',
  'CRV',
  'BAL',
  'SNX',
  'BRETT',
  'DEGEN',
];

// Known Base Sepolia testnet tokens (keep minimal list for testnet)
export const KNOWN_BASE_SEPOLIA_TOKENS: Record<string, Token> = {
  // WETH (Wrapped Ether) - Official Base Sepolia WETH
  '0x4200000000000000000000000000000000000006': {
    address: '0x4200000000000000000000000000000000000006',
    chainId: baseSepolia.id,
    decimals: 18,
    name: 'Wrapped Ether',
    symbol: 'WETH',
    image: 'https://ethereum-optimism.github.io/logos/WETH.svg',
  },
  // USDC - Most widely used USDC on Base Sepolia
  '0x036cbd53842c5426634e7929541ec2318f3dcf7e': {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    chainId: baseSepolia.id,
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    image: 'https://ethereum-optimism.github.io/logos/USDC.svg',
  },
  // EURC
  '0x808456652fdb597867f38412077a9182bf77359f': {
    address: '0x808456652fdb597867f38412077A9182bf77359F',
    chainId: baseSepolia.id,
    decimals: 6,
    name: 'Euro Coin',
    symbol: 'EURC',
    image: null,
  },
};

/**
 * Fetch popular tokens for Base mainnet
 */
export async function fetchPopularTokens(): Promise<Token[]> {
  const cacheKey = 'popular_base_tokens';
  
  // Check cache first
  if (tokenCache.has(cacheKey)) {
    return tokenCache.get(cacheKey)!;
  }

  const tokens: Token[] = [];
  const uniqueAddresses = new Set<string>();

  try {
    // Fetch popular tokens in batches
    for (let i = 0; i < POPULAR_BASE_TOKENS.length; i += 5) {
      const batch = POPULAR_BASE_TOKENS.slice(i, i + 5);
      
      await Promise.all(
        batch.map(async (symbol) => {
          try {
            const result = await getTokens({ 
              limit: '1', 
              search: symbol 
            });
            
            if (Array.isArray(result) && result.length > 0) {
              const token = result[0];
              // Avoid duplicates
              if (!uniqueAddresses.has(token.address.toLowerCase())) {
                uniqueAddresses.add(token.address.toLowerCase());
                tokens.push({
                  ...token,
                  chainId: base.id,
                });
              }
            }
          } catch (error) {
            console.error(`Failed to fetch token ${symbol}:`, error);
          }
        })
      );
      
      // Small delay between batches to avoid rate limiting
      if (i + 5 < POPULAR_BASE_TOKENS.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Cache the results
    tokenCache.set(cacheKey, tokens);
    return tokens;
  } catch (error) {
    console.error('Failed to fetch popular tokens:', error);
    return [];
  }
}

/**
 * Search for tokens by name, symbol, or address
 */
export async function searchTokens(query: string, limit: number = 10): Promise<Token[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const result = await getTokens({ 
      limit: limit.toString(), 
      search: query 
    });
    
    if (Array.isArray(result) && result.length > 0) {
      return result.map(token => ({
        ...token,
        chainId: base.id,
      }));
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
export async function fetchTokenByAddress(address: string): Promise<Token | null> {
  const normalizedAddress = address.toLowerCase();
  
  // Check single token cache
  if (singleTokenCache.has(normalizedAddress)) {
    return singleTokenCache.get(normalizedAddress)!;
  }

  try {
    const result = await getTokens({ 
      limit: '1', 
      search: address 
    });
    
    if (Array.isArray(result) && result.length > 0) {
      const token = {
        ...result[0],
        chainId: base.id,
      };
      singleTokenCache.set(normalizedAddress, token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to fetch token ${address}:`, error);
    return null;
  }
}

/**
 * Fetch multiple tokens by their addresses
 */
export async function fetchTokensByAddresses(addresses: string[]): Promise<Token[]> {
  const tokens: Token[] = [];
  
  await Promise.all(
    addresses.map(async (address) => {
      const token = await fetchTokenByAddress(address);
      if (token) {
        tokens.push(token);
      }
    })
  );
  
  return tokens;
}

/**
 * Get all tokens with balances (combines API tokens with user's wallet tokens)
 */
export async function getTokensWithBalances(
  walletTokenAddresses: string[],
  chainId: number
): Promise<Token[]> {
  // For Base Sepolia, use the hardcoded list
  if (chainId === baseSepolia.id) {
    return Object.values(KNOWN_BASE_SEPOLIA_TOKENS);
  }

  // For Base mainnet, fetch popular tokens and user's specific tokens
  const [popularTokens, walletTokens] = await Promise.all([
    fetchPopularTokens(),
    fetchTokensByAddresses(walletTokenAddresses)
  ]);

  // Merge and deduplicate
  const tokenMap = new Map<string, Token>();
  
  [...popularTokens, ...walletTokens].forEach(token => {
    const key = token.address.toLowerCase();
    if (!tokenMap.has(key)) {
      tokenMap.set(key, token);
    }
  });

  return Array.from(tokenMap.values());
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
  return `https://ui-avatars.com/api/?name=${token.symbol}&background=3374FF&color=fff&size=128`;
}

/**
 * Clear token cache (useful when switching networks)
 */
export function clearTokenCache(): void {
  tokenCache.clear();
  singleTokenCache.clear();
}