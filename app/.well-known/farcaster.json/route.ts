import { NextResponse } from 'next/server';

function withValidProperties(
  properties: Record<string, undefined | string | string[] | boolean>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value
    )
  );
}

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
  const projectName = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'HODL Vault';

  return NextResponse.json({
    // Valid account association from Base Build
    accountAssociation: {
      header: "eyJmaWQiOjExMzU5NTMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg0MjYzODU0ZjhkMDRkYmVCMERFZkYwNzlmNEViZDE4MGJhMTY4RjlEIn0",
      payload: "eyJkb21haW4iOiJ3d3cuYmFzZS1ob2RsLnh5eiJ9",
      signature: "Wklk0KhLSQLnEbuf2RbHh35RzDvI52No1LpaYPgjJ5d7tg01cNxt+FGXu6hMHQQoG9dRFqWFRUPZ8Nx3KP5AdBs="
    },

    // Frame configuration - all properties must be inside frame object
    frame: withValidProperties({
      version: "1",
      name: projectName,
      iconUrl: `${appUrl}/icon-512.png`,
      homeUrl: appUrl,
      imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${appUrl}/og-image.png`,
      buttonTitle: `Launch ${projectName}`,
      splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE || `${appUrl}/og-image.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || '#0A0B0D',
      webhookUrl: `${appUrl}/api/webhook`,

      // Metadata
      subtitle: "Lock tokens with diamond hands",
      description: 'Time-lock any ERC-20 token on Base. Prove your diamond hands with no early withdrawal.',
      tagline: "No early withdrawal. No regrets. Just gains.",

      // Discovery and categorization
      primaryCategory: 'defi',
      tags: ['token-locking', 'time-vaults', 'erc20', 'base', 'hodl', 'diamond-hands'],

      // Images
      screenshotUrls: [
        `${appUrl}/og-image.png`
      ],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${appUrl}/og-image.png`,

      // OpenGraph metadata
      ogTitle: `${projectName} - Diamond Hands Token Locker`,
      ogDescription: 'Lock your tokens with diamond hands. No early withdrawal, completely free on Base.',
      ogImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${appUrl}/og-image.png`,

      // Cast share URL for when users share the frame
      castShareUrl: appUrl,

      // Development flag - remove for production
      noindex: process.env.NODE_ENV === 'development'
    })
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}