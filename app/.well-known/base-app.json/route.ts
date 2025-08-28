import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
  
  const baseAppConfig = {
    // Base Mini App Configuration
    app: {
      id: 'hodl-vault',
      name: 'HODL Vault',
      description: 'Time-lock any ERC-20 token with fixed durations on Base. Prove your diamond hands with secure vaults.',
      shortDescription: 'Lock tokens with diamond hands on Base',
      version: '1.0.0',
      author: {
        name: 'HODL Vault Team',
        website: appUrl
      },
      homepage: appUrl,
      repository: 'https://github.com/yourusername/base-hodl-xyz', // Update with your repo
      license: 'MIT'
    },
    
    // Technical specifications
    technical: {
      blockchain: 'base',
      chainId: 8453,
      network: 'mainnet',
      contractAddress: process.env.NEXT_PUBLIC_VAULT_ADDRESS,
      framework: 'nextjs',
      wallet: {
        supportedProviders: ['coinbase', 'metamask', 'rainbow', 'walletconnect'],
        requiresConnection: true
      },
      features: [
        'erc20-locking',
        'time-vaults',
        'no-early-withdrawal',
        'free-to-use',
        'social-sharing',
        'farcaster-frames'
      ]
    },
    
    // Discovery metadata
    discovery: {
      category: 'defi',
      subcategory: 'vaults',
      tags: [
        'hodl',
        'lock',
        'vault',
        'time-lock',
        'diamond-hands',
        'erc20',
        'defi',
        'base'
      ],
      featured: false,
      new: true,
      trending: false
    },
    
    // UI/UX configuration
    ui: {
      theme: {
        primaryColor: '#0052FF',
        secondaryColor: '#0A0B0D',
        mode: 'both' // supports dark and light
      },
      icons: {
        favicon: `${appUrl}/favicon.ico`,
        small: `${appUrl}/icon-72.png`,
        medium: `${appUrl}/icon-192.png`,
        large: `${appUrl}/icon-512.png`,
        og: `${appUrl}/og-image.png`
      },
      screenshots: [
        {
          url: `${appUrl}/screenshot-home.png`,
          caption: 'Lock creation interface'
        },
        {
          url: `${appUrl}/screenshot-dashboard.png`,
          caption: 'User dashboard'
        }
      ]
    },
    
    // Integration endpoints
    endpoints: {
      home: appUrl,
      dashboard: `${appUrl}/dashboard`,
      farcasterFrame: `${appUrl}/.well-known/farcaster.json`,
      api: {
        webhook: `${appUrl}/api/webhook`,
        stats: `${appUrl}/api/stats`
      }
    },
    
    // Social links
    social: {
      farcaster: '@hodlvault', // Update with your handle
      twitter: '@hodlvault',   // Update with your handle
      github: 'https://github.com/yourusername/base-hodl-xyz' // Update
    },
    
    // Analytics and metrics
    metrics: {
      totalValueLocked: '0', // This could be dynamically fetched
      totalLocks: '0',
      activeUsers: '0',
      averageLockDuration: '180' // days
    },
    
    // Compliance and security
    compliance: {
      audit: false,
      openSource: true,
      nonCustodial: true,
      permissionless: true
    }
  };

  return NextResponse.json(baseAppConfig, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'X-Base-App': 'hodl-vault'
    }
  });
}