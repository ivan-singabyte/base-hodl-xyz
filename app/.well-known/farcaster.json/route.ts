import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
  const projectName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'HODL Vault';

  // This is the MiniKit manifest format for Farcaster frames
  const manifest = {
    version: '1.0.0',
    name: projectName,
    description: 'Time-lock any ERC-20 token on Base. Prove your diamond hands with no early withdrawal.',
    homeUrl: appUrl,
    iconUrl: `${appUrl}/icon-512.png`,
    splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE || `${appUrl}/og-image.png`,
    splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || '#0A0B0D',
    webhookUrl: `${appUrl}/api/webhook`,

    // Frame configuration
    frame: {
      version: 'next',
      name: projectName,
      imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${appUrl}/og-image.png`,
      button: {
        title: `Launch ${projectName}`,
        action: {
          type: 'launch_frame',
          name: projectName,
          url: appUrl,
          splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE || `${appUrl}/og-image.png`,
          splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || '#0A0B0D',
        },
      },
    },

    // Categories and tags for discovery
    primaryCategory: 'defi',
    tags: ['token-locking', 'time-vaults', 'erc20', 'base', 'hodl', 'diamond-hands'],

    // App screenshots for store listing
    screenshotUrls: [
      `${appUrl}/og-image.png`
    ],

    // Account association (needs to be generated via Base Build tool)
    // These are placeholder values - you'll need to generate real ones
    accountAssociation: {
      header: 'eyJmaWQiOjEsInR5cGUiOiJhcHAiLCJrZXkiOiIweDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAifQ==',
      payload: 'eyJkb21haW4iOiJiYXNlLWhvZGwueHl6IiwidGltZXN0YW1wIjoxNzAwMDAwMDAwLCJleHBpcmVzQXQiOjE5MDAwMDAwMDB9',
      signature: '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}