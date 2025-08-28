/**
 * Utility functions for handling environment variables
 */

/**
 * Cleans an environment variable by removing whitespace and newlines
 * @param envVar - The environment variable value to clean
 * @returns The cleaned environment variable
 */
export function cleanEnvVar(envVar: string | undefined): string {
  if (!envVar) return '';
  // Remove all whitespace including spaces, tabs, newlines, etc.
  return envVar.trim().replace(/\s+/g, '').replace(/[\r\n]+/g, '');
}

/**
 * Gets and cleans the vault address from environment
 * @returns The cleaned vault address
 */
export function getVaultAddress(): `0x${string}` {
  const raw = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '';
  return cleanEnvVar(raw) as `0x${string}`;
}

/**
 * Gets and cleans the WalletConnect project ID from environment
 * @returns The cleaned project ID
 */
export function getWalletConnectProjectId(): string {
  const raw = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';
  return cleanEnvVar(raw) || 'YOUR_WALLETCONNECT_PROJECT_ID';
}

/**
 * Gets and cleans the OnchainKit API key from environment
 * @returns The cleaned API key
 */
export function getOnchainKitApiKey(): string {
  const raw = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || '';
  return cleanEnvVar(raw);
}