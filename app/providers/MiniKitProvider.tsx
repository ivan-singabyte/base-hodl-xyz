'use client';

import { ReactNode, useEffect, useState } from 'react';
import sdk from '@farcaster/miniapp-sdk';

interface MiniKitProviderProps {
  children: ReactNode;
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // The SDK initializes automatically when imported
        // Check if we have context (indicates we're in a Mini App)
        if (sdk.context) {
          const context = await sdk.context;
          console.log('MiniKit SDK initialized successfully');
          console.log('Context:', context);
          console.log('User:', context?.user);
        } else {
          console.log('Not in a Mini App context');
        }
        
      } catch (error) {
        console.error('Failed to initialize MiniKit SDK:', error);
      }
    };

    initializeSDK();
  }, []);

  // Always render children, even if SDK isn't ready
  // This ensures the app works in non-Frame contexts
  return <>{children}</>;
}

// Export a hook to use the SDK context
export function useMiniKit() {
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [user, setUser] = useState<{
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null>(null);

  useEffect(() => {
    // The SDK doesn't have a ready() method - it's immediately available
    // Check for context to determine if we're in a Mini App
    const checkContext = async () => {
      try {
        if (sdk.context) {
          const context = await sdk.context;
          setIsInMiniApp(true);
          // Only extract serializable user data to avoid DataCloneError
          if (context.user) {
            const userData = {
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
              // Add any other serializable fields as needed
            };
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error accessing MiniKit context:', error);
      }
      setIsSDKReady(true);
    };
    
    checkContext();
  }, []);

  // Return only serializable data, not the raw SDK context
  return {
    isSDKReady,
    isInMiniApp,
    user,
    // Export individual SDK actions as needed instead of entire context
    actions: isInMiniApp ? {
      openUrl: sdk.actions?.openUrl,
      // Add other actions as needed
    } : null,
  };
}