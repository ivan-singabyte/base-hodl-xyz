'use client';

import { base, baseSepolia } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
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
import { MiniKitProvider } from './providers/MiniKitProvider';

const queryClient = new QueryClient();

// Use a default project ID if none is provided (for development)
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'a95c8e9bb64dc949076e66e1f16b4a2e';

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

const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
            config={{ 
              appearance: { 
                mode: 'auto',
                theme: 'base'
              }
            }}
          >
            <RainbowKitProvider modalSize="compact">
              {props.children}
            </RainbowKitProvider>
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MiniKitProvider>
  );
}

