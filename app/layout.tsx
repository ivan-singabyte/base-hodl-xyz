import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { AuthProvider } from './contexts/AuthContext';

export const metadata: Metadata = {
  title: 'HODL Vault - Lock Your Tokens with Diamond Hands',
  description: 'Lock any ERC-20 token with fixed durations on Base. No early withdrawal, completely free.',
  metadataBase: new URL('https://base-hodl.xyz'),
  keywords: ['hodl', 'lock', 'vault', 'time-lock', 'diamond hands', 'erc20', 'tokens', 'defi', 'base', 'cryptocurrency', 'web3'],
  authors: [{ name: 'HODL Vault Team' }],
  creator: 'HODL Vault',
  publisher: 'HODL Vault',
  category: 'defi',
  openGraph: {
    title: 'HODL Vault - Diamond Hands Token Locker',
    description: 'Lock your tokens with diamond hands. No early withdrawal, completely free on Base.',
    type: 'website',
    locale: 'en_US',
    url: 'https://base-hodl.xyz',
    siteName: 'HODL Vault',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HODL Vault - Lock Your Tokens',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HODL Vault - Diamond Hands Token Locker',
    description: 'Lock your tokens with diamond hands on Base',
    images: ['/og-image.png'],
    creator: '@base',
    site: '@base',
  },
  other: {
    // Farcaster Frame metadata (required for Farcaster discovery)
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://base-hodl.xyz/og-image.png',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': 'Lock Tokens 🔒',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://base-hodl.xyz',
    'fc:frame:button:2': 'View Dashboard 📊',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': 'https://base-hodl.xyz/dashboard',
    'fc:frame:button:3': 'How It Works ❓',
    'fc:frame:button:3:action': 'link',
    'fc:frame:button:3:target': 'https://base-hodl.xyz/#how-it-works',
    
    // Base Mini App metadata (for Base ecosystem discovery)
    'base:app': 'hodl-vault',
    'base:app:name': 'HODL Vault',
    'base:app:description': 'Time-lock ERC-20 tokens with diamond hands on Base',
    'base:app:category': 'defi',
    'base:app:chain': 'base',
    'base:app:type': 'web',
    
    // OnchainKit App Store metadata
    'onchainkit:version': '1.0.0',
    'onchainkit:chain': '8453', // Base mainnet chain ID
    'onchainkit:app-store': 'true',
    'onchainkit:app-id': 'hodl-vault',
    'onchainkit:app-category': 'defi'
    
    // Additional app discovery metadata
    'application-name': 'HODL Vault',
    'apple-mobile-web-app-title': 'HODL Vault',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.ico' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HODL Vault',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A0B0D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="HODL Vault" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HODL Vault" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
