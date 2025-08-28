import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
  
  const frameMetadata = getFrameMetadata({
    buttons: [
      {
        label: 'Lock Tokens 🔒',
        action: 'link',
        target: `${appUrl}`
      },
      {
        label: 'View Dashboard 📊',
        action: 'link', 
        target: `${appUrl}/dashboard`
      },
      {
        label: 'Learn More ❓',
        action: 'link',
        target: `${appUrl}#how-it-works`
      }
    ],
    image: {
      src: `${appUrl}/og-image.png`,
      aspectRatio: '1.91:1'
    },
    postUrl: `${appUrl}/api/frame`,
    state: {
      time: new Date().toISOString()
    }
  });

  return {
    title: 'HODL Vault - Lock Your Tokens',
    description: 'Time-lock any ERC-20 token on Base with diamond hands',
    openGraph: {
      title: 'HODL Vault Frame',
      description: 'Lock your tokens with diamond hands on Base',
      images: [`${appUrl}/og-image.png`]
    },
    other: {
      ...frameMetadata
    }
  };
}

export default function Frame() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">HODL Vault</h1>
        <p className="text-xl text-gray-300">
          Time-lock any ERC-20 token on Base. Prove your diamond hands.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Lock Tokens
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}