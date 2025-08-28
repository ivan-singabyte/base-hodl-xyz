import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract button index from the Farcaster frame request
    const buttonIndex = body?.untrustedData?.buttonIndex || 0;
    const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
    
    // Handle different button actions
    let redirectUrl = appUrl;
    switch (buttonIndex) {
      case 1:
        redirectUrl = appUrl; // Lock Tokens
        break;
      case 2:
        redirectUrl = `${appUrl}/dashboard`; // View Dashboard
        break;
      case 3:
        redirectUrl = `${appUrl}#how-it-works`; // Learn More
        break;
      default:
        redirectUrl = appUrl;
    }

    // Return frame response
    return NextResponse.json({
      type: 'frame',
      frameUrl: redirectUrl,
      message: `Redirecting to ${buttonIndex === 1 ? 'Lock Tokens' : buttonIndex === 2 ? 'Dashboard' : 'Learn More'}...`
    });
  } catch (error) {
    console.error('Frame processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process frame request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return frame metadata for GET requests
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://base-hodl.xyz';
  
  return NextResponse.json({
    name: 'HODL Vault',
    description: 'Lock your tokens with diamond hands on Base',
    image: `${appUrl}/og-image.png`,
    buttons: [
      { label: 'Lock Tokens 🔒', action: 'link' },
      { label: 'View Dashboard 📊', action: 'link' },
      { label: 'Learn More ❓', action: 'link' }
    ]
  });
}