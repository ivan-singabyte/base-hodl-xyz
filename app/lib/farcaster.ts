/**
 * Farcaster Frame Detection and Integration Utilities
 * Enhanced with MiniKit SDK integration
 */

import sdk from '@farcaster/miniapp-sdk';

export interface FrameContext {
  isFrame: boolean;
  platform: 'farcaster' | 'warpcast' | 'base' | 'web';
  frameVersion?: string;
  userAgent?: string;
}

/**
 * Detects if the app is running inside a Farcaster Frame
 */
export function detectFrameContext(): FrameContext {
  if (typeof window === 'undefined') {
    return { isFrame: false, platform: 'web' };
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for Frame-specific URL parameters
  const frameParam = urlParams.get('frame');
  const contextParam = urlParams.get('context');
  
  // Check for Farcaster/Warpcast user agents
  const isWarpcast = userAgent.includes('warpcast');
  const isFarcaster = userAgent.includes('farcaster');
  const isBaseApp = userAgent.includes('base') || userAgent.includes('coinbase');
  
  // Check for Frame-specific window properties
  const hasFrameContext = 'frameContext' in window || 'fc' in window;
  
  // Check if running in an iframe (common for Frames)
  const isInIframe = window.self !== window.top;
  
  // Determine platform
  let platform: FrameContext['platform'] = 'web';
  let isFrame = false;
  
  if (frameParam === 'true' || contextParam === 'frame' || hasFrameContext) {
    isFrame = true;
    platform = 'farcaster';
  } else if (isWarpcast) {
    platform = 'warpcast';
    isFrame = true;
  } else if (isFarcaster) {
    platform = 'farcaster';
    isFrame = true;
  } else if (isBaseApp) {
    platform = 'base';
    // Base app may or may not be a frame context
    isFrame = isInIframe || frameParam === 'true';
  }
  
  return {
    isFrame,
    platform,
    userAgent: window.navigator.userAgent,
  };
}

/**
 * Get optimal dimensions for Farcaster Frames
 * Frames work best with 1:1 or 1.91:1 aspect ratios
 */
export function getFrameDimensions() {
  const context = detectFrameContext();
  
  if (!context.isFrame) {
    return null;
  }
  
  // Farcaster Frame optimal dimensions
  return {
    square: { width: 600, height: 600 }, // 1:1 aspect ratio
    wide: { width: 600, height: 314 },   // 1.91:1 aspect ratio
    maxWidth: 600,
    maxHeight: 600,
  };
}

/**
 * Format share text for Farcaster
 */
export function formatFarcasterShare(lockData: {
  tokenSymbol: string;
  amount: string;
  duration: string;
  txHash?: string;
}) {
  const { tokenSymbol, amount, duration, txHash } = lockData;
  
  let text = `Just locked ${amount} ${tokenSymbol} for ${duration} with @hodlvault on @base! 💎👐\n\n`;
  
  if (txHash) {
    text += `View on Basescan: https://basescan.org/tx/${txHash}\n`;
  }
  
  text += `\nLock your tokens: https://base-hodl.xyz`;
  
  return text;
}

/**
 * Generate Farcaster Frame metadata
 */
export function generateFrameMetadata(data: {
  title: string;
  description: string;
  image: string;
  buttons?: Array<{ label: string; action: string }>;
}) {
  const metadata: Record<string, string> = {
    'fc:frame': 'vNext',
    'fc:frame:image': data.image,
    'og:image': data.image,
    'og:title': data.title,
    'og:description': data.description,
  };
  
  // Add button metadata if provided
  if (data.buttons) {
    data.buttons.forEach((button, index) => {
      metadata[`fc:frame:button:${index + 1}`] = button.label;
      metadata[`fc:frame:button:${index + 1}:action`] = button.action;
    });
  }
  
  return metadata;
}

/**
 * Hook to detect and use Frame context
 */
export function useFrameContext() {
  if (typeof window === 'undefined') {
    return { isFrame: false, platform: 'web' as const };
  }
  
  return detectFrameContext();
}

/**
 * Generate a shareable Warpcast URL
 */
export function getWarpcastShareUrl(text: string, embeds?: string[]): string {
  const baseUrl = 'https://warpcast.com/~/compose';
  const params = new URLSearchParams();
  
  params.append('text', text);
  
  if (embeds && embeds.length > 0) {
    embeds.forEach(embed => params.append('embeds[]', embed));
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Optimize component for Frame rendering
 */
export function getFrameStyles(isFrame: boolean) {
  if (!isFrame) return {};
  
  return {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '16px',
    // Ensure content fits within Frame viewport
    overflow: 'hidden',
    // Optimize for mobile viewing
    fontSize: '16px',
    lineHeight: '1.5',
  };
}

/**
 * MiniKit SDK Actions wrapper for social sharing
 */
export async function shareWithSDK(text: string, url?: string) {
  try {
    // Check if SDK has context (indicates we're in a Mini App)
    if (!sdk.context) {
      throw new Error('Not in a Mini App context');
    }
    
    // Use compose cast action
    const shareUrl = getWarpcastShareUrl(text, url ? [url] : undefined);
    await sdk.actions.openUrl(shareUrl);
    
    return true;
  } catch (error) {
    console.error('SDK share failed:', error);
    return false;
  }
}

/**
 * Open a user profile using SDK actions
 */
export async function viewProfile(username: string) {
  try {
    // Check if SDK has context
    if (!sdk.context) {
      throw new Error('Not in a Mini App context');
    }
    
    // Open profile URL
    await sdk.actions.openUrl(`https://warpcast.com/${username}`);
    
    return true;
  } catch (error) {
    console.error('Failed to view profile:', error);
    return false;
  }
}

/**
 * Check if we should use SDK actions
 */
export function shouldUseSDKActions(): boolean {
  try {
    return !!sdk.context;
  } catch {
    return false;
  }
}