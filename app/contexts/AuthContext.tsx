'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface FarcasterUser {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface AuthContextType {
  isConnected: boolean;
  address: string | undefined;
  isGuest: boolean;
  requireAuth: () => void;
  disconnect: () => void;
  farcasterUser: FarcasterUser | null;
  isInMiniApp: boolean;
  signInWithFarcaster: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);
  const isInMiniApp = false; // Removed MiniKit support

  useEffect(() => {
    if (isConnected) {
      setIsGuest(false);
      setShowAuthModal(false);
    }
  }, [isConnected]);

  // Farcaster user will be set through other means if needed
  useEffect(() => {
    // Reserved for future Farcaster integration
  }, []);

  const requireAuth = () => {
    console.log('requireAuth called', { isConnected, farcasterUser });
    if (!isConnected) {
      console.log('Showing auth modal');
      setShowAuthModal(true);
    }
  };

  const signInWithFarcaster = useCallback(() => {
    try {
      console.log('SIWF requires backend integration for production');
      // In production, you would call your backend endpoint here
      // that handles the SIWF flow
      return Promise.resolve();
    } catch (error) {
      console.error('Farcaster sign in failed:', error);
      // Fall back to wallet connection
      return Promise.resolve();
    }
  }, []);

  // Enhanced disconnect that clears all auth state
  const disconnect = useCallback(() => {
    // Disconnect wallet
    wagmiDisconnect();
    // Clear Farcaster user
    setFarcasterUser(null);
    // Reset guest state
    setIsGuest(true);
    // Close any open auth modals
    setShowAuthModal(false);
  }, [wagmiDisconnect]);

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        address,
        isGuest: isGuest && !farcasterUser,
        requireAuth,
        disconnect,
        farcasterUser,
        isInMiniApp,
        signInWithFarcaster,
      }}
    >
      {children}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-[101] shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Connect to Continue</h2>
            <p className="text-gray-600 mb-6">
              {isInMiniApp 
                ? 'Sign in with Farcaster or connect your wallet to continue'
                : 'Connect your wallet to continue'
              }
            </p>
            {isInMiniApp && (
              <button
                onClick={signInWithFarcaster}
                className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Sign In with Farcaster
              </button>
            )}
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}