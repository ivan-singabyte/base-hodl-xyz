'use client';

import { base, baseSepolia } from 'wagmi/chains';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http, useChainId } from 'wagmi';
import {
  RainbowKitProvider,
  connectorsForWallets
} from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  walletConnectWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import '@rainbow-me/rainbowkit/styles.css';
import type { ReactNode } from 'react';
import { isStaging } from './lib/config';

const queryClient = new QueryClient();

// Clean the project ID - remove any whitespace or newlines
const rawProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';
const projectId = rawProjectId.trim().replace(/\s+/g, '').replace(/\n/g, '') || 'YOUR_WALLETCONNECT_PROJECT_ID';

// Configure wallets with Coinbase/Base Account as priority
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        coinbaseWallet, // Prioritize Coinbase Wallet (includes Smart Wallet)
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'HODL Vault',
    projectId,
  }
);

// Determine chains based on environment
// In staging, ONLY use Sepolia to prevent mainnet connections
const chains = isStaging ? [baseSepolia] : [base, baseSepolia];
const defaultChain = isStaging ? baseSepolia : base;

const wagmiConfig = createConfig({
  chains: chains as [typeof baseSepolia] | [typeof base, typeof baseSepolia],
  connectors,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Inner component that can use wagmi hooks
function MiniKitProviderWrapper({ children }: { children: ReactNode }) {
  const chainId = useChainId();
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY?.trim() || '';

  // In staging, force Sepolia. In production, use the connected chain or default to mainnet
  const currentChain = isStaging ? baseSepolia : (chainId === baseSepolia.id ? baseSepolia : base);
  const rpcUrl = currentChain.id === base.id ? 'https://mainnet.base.org' : 'https://sepolia.base.org';

  return (
    <MiniKitProvider
      apiKey={apiKey}
      chain={currentChain}
      config={{
        appearance: {
          mode: 'auto',
          theme: 'mini-app-theme',
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'HODL Vault',
          logo: process.env.NEXT_PUBLIC_APP_HERO_IMAGE
        }
      }}
      rpcUrl={rpcUrl}
      autoConnect
    >
      <RainbowKitProvider
        modalSize="compact"
        initialChain={defaultChain}
      >
        {children}
      </RainbowKitProvider>
    </MiniKitProvider>
  );
}

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProviderWrapper>
          {props.children}
        </MiniKitProviderWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

