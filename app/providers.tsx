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

const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function Providers(props: { children: ReactNode }) {
  // Clean the API key as well
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY?.trim() || '';
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={apiKey}
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
  );
}

