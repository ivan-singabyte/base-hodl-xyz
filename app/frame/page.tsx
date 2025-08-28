import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
  
  return {
    title: 'HODL Vault - Lock Your Tokens',
    description: 'Time-lock any ERC-20 token on Base with diamond hands',
    openGraph: {
      title: 'HODL Vault Frame',
      description: 'Lock your tokens with diamond hands on Base',
      images: [`${appUrl}/og-image.png`]
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': `${appUrl}/og-image.png`,
      'fc:frame:image:aspect_ratio': '1.91:1',
      'fc:frame:button:1': 'Lock Tokens 🔒',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': `${appUrl}`,
      'fc:frame:button:2': 'View Dashboard 📊',
      'fc:frame:button:2:action': 'link',
      'fc:frame:button:2:target': `${appUrl}/dashboard`,
      'fc:frame:button:3': 'Learn More ❓',
      'fc:frame:button:3:action': 'link',
      'fc:frame:button:3:target': `${appUrl}#how-it-works`,
      'fc:frame:post_url': `${appUrl}/api/frame`
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
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Lock Tokens
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}