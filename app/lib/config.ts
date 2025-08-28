import { base, baseSepolia } from 'wagmi/chains';

// Environment detection
export const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true';
export const isProduction = process.env.NODE_ENV === 'production' && !isStaging;
export const isDevelopment = process.env.NODE_ENV === 'development';

// Chain configuration based on environment
export const getChainConfig = () => {
  if (isProduction) {
    return {
      chain: base,
      chainId: 8453,
      chainName: 'Base',
      blockExplorer: 'https://basescan.org',
      rpcUrl: 'https://mainnet.base.org',
    };
  }
  
  // Staging and development use Sepolia
  return {
    chain: baseSepolia,
    chainId: 84532,
    chainName: 'Base Sepolia',
    blockExplorer: 'https://sepolia.basescan.org',
    rpcUrl: 'https://sepolia.base.org',
  };
};

// Contract addresses based on environment
export const getContractAddresses = () => {
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS;
  
  if (!vaultAddress) {
    throw new Error('NEXT_PUBLIC_VAULT_ADDRESS is not configured');
  }
  
  return {
    vaultAddress,
    // Add other contract addresses here as needed
  };
};

// API endpoints based on environment
export const getApiConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  return {
    baseUrl,
    frameUrl: `${baseUrl}/api/frame`,
    // Add other API endpoints here
  };
};

// Feature flags for different environments
export const featureFlags = {
  enableTestTokens: !isProduction,
  showNetworkBadge: isStaging || isDevelopment,
  enableDebugMode: isDevelopment,
  allowMockTransactions: isDevelopment,
};

// Environment badge configuration
export const getEnvironmentBadge = () => {
  if (isProduction) return null;
  if (isStaging) return { text: 'STAGING', color: 'bg-yellow-500' };
  if (isDevelopment) return { text: 'DEV', color: 'bg-blue-500' };
  return null;
};

export default {
  isStaging,
  isProduction,
  isDevelopment,
  getChainConfig,
  getContractAddresses,
  getApiConfig,
  featureFlags,
  getEnvironmentBadge,
};