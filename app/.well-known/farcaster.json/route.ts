import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
  
  const config = {
    // Account association for Farcaster app verification
    accountAssociation: {
      header: 'eyJmaWQiOjE2MjIsInR5cGUiOiJhcHAiLCJrZXkiOiIweDAwIn0=',
      signature: '0x0000000000000000000000000000000000000000000000000000000000000000',
      signer: '0x0000000000000000000000000000000000000000'
    },
    
    // Frame configuration for Farcaster mini-app
    frame: {
      version: 'vNext',
      name: 'HODL Vault',
      iconUrl: `${appUrl}/icon-512.png`,
      splashImageUrl: `${appUrl}/og-image.png`,
      splashBackgroundColor: '#0A0B0D',
      homeUrl: appUrl,
      webhookUrl: `${appUrl}/api/webhook`
    },
    
    // Mini-app metadata for discovery
    miniApp: {
      name: 'HODL Vault',
      description: 'Time-lock any ERC-20 token on Base. Prove your diamond hands.',
      category: 'defi',
      chainId: 8453, // Base mainnet
      features: ['token-locking', 'time-vaults', 'erc20-support'],
      supportedWallets: ['coinbase', 'metamask', 'rainbow', 'walletconnect'],
      primaryColor: '#0052FF',
      icon: {
        small: `${appUrl}/icon-72.png`,
        medium: `${appUrl}/icon-192.png`,
        large: `${appUrl}/icon-512.png`
      }
    }
  };

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}