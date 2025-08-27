'use client';

import { useEffect, useState } from 'react';
import { detectFrameContext, getFrameStyles, type FrameContext } from '@/app/lib/farcaster';

interface FrameWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function FrameWrapper({ children, className = '' }: FrameWrapperProps) {
  const [frameContext, setFrameContext] = useState<FrameContext>({ 
    isFrame: false, 
    platform: 'web' 
  });

  useEffect(() => {
    const context = detectFrameContext();
    setFrameContext(context);

    // Add Frame-specific class to body for global styling
    if (context.isFrame) {
      document.body.classList.add('frame-context', `frame-${context.platform}`);
      
      // Optimize for mobile if in Frame
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }

    return () => {
      document.body.classList.remove('frame-context', `frame-${frameContext.platform}`);
    };
  }, []);

  const frameStyles = getFrameStyles(frameContext.isFrame);

  return (
    <div 
      className={`frame-wrapper ${className}`}
      style={frameStyles}
      data-frame={frameContext.isFrame}
      data-platform={frameContext.platform}
    >
      {/* Frame indicator badge for development */}
      {process.env.NODE_ENV === 'development' && frameContext.isFrame && (
        <div className="fixed top-2 right-2 z-50 bg-base-blue text-white text-xs px-2 py-1 rounded-full">
          Frame: {frameContext.platform}
        </div>
      )}
      
      {children}
    </div>
  );
}