import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  const config = {
    accountAssociation: {
      header: 'eyJmaWQiOjE2MjIsInR5cGUiOiJhcHAiLCJrZXkiOiIweDAwIn0=',
      signature: '0x0000000000000000000000000000000000000000000000000000000000000000',
      signer: '0x0000000000000000000000000000000000000000'
    },
    frame: {
      version: '1',
      name: 'HODL Vault',
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#000000',
      homeUrl: appUrl
    }
  };

  return NextResponse.json(config);
}