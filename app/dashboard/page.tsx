'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import HodlVaultABI from '../../artifacts/contracts/HodlVault.sol/HodlVault.json';
import { UserProfile } from '../components/UserProfile';
import { useAuth } from '../contexts/AuthContext';

// Lazy load the ActiveLocks component
const ActiveLocks = dynamic(() => import('../components/ActiveLocks'), {
  loading: () => (
    <div className="flex justify-center items-center h-32">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-base-blue border-r-transparent"></div>
      <p className="ml-2 text-foreground-secondary">Loading locks...</p>
    </div>
  ),
  ssr: false
});

// Clean the vault address - remove any whitespace or newlines
const rawVaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '';
const VAULT_ADDRESS = rawVaultAddress.trim().replace(/\s+/g, '').replace(/\n/g, '') as `0x${string}`;

// Lock interface is imported from ActiveLocks component

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const { requireAuth } = useAuth();
  const { setFrameReady } = useMiniKit();
  const [mounted, setMounted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user's locks for statistics
  const { refetch } = useReadContract({
    address: VAULT_ADDRESS,
    abi: HodlVaultABI.abi,
    functionName: 'getUserLocks',
    args: address ? [address] : undefined,
  });

  // Fetch total locks count
  const { data: totalLocks } = useReadContract({
    address: VAULT_ADDRESS,
    abi: HodlVaultABI.abi,
    functionName: 'totalLocks',
  });

  useEffect(() => {
    setMounted(true);
    // Set frame ready for MiniKit
    setFrameReady();
  }, [setFrameReady]);


  const handleClaimSuccess = () => {
    setSuccessMessage('Tokens claimed successfully! 🎉');
    refetch();
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-base-blue border-r-transparent"></div>
          <p className="mt-2 text-foreground-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-base-blue/10">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-base-blue to-base-blue-light bg-clip-text text-transparent">
                HODL Dashboard
              </h1>
              <p className="text-sm text-foreground-secondary mt-1">View and manage your locked tokens</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="hidden sm:inline-flex touch-target px-4 py-2 bg-gradient-to-r from-base-blue to-base-blue-dark text-white rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all transform font-semibold"
              >
                New Lock
              </Link>
              {mounted && isConnected && <UserProfile />}
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-success-light border border-success/20 p-4 rounded-lg animate-slide-down">
            <p className="text-success font-medium text-center flex items-center justify-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {isConnected ? (
          <>
            {/* Platform Stats */}
            <div className="mb-8">
              <div className="card glass backdrop-blur-xl border border-border animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-secondary mb-1">Platform Total Locks</p>
                    <p className="text-3xl font-bold text-foreground">
                      {totalLocks ? Number(totalLocks) : 0}
                    </p>
                  </div>
                  <div className="text-4xl">🌍</div>
                </div>
              </div>
            </div>

            {/* Active Locks Section */}
            <div className="card glass backdrop-blur-xl border border-border animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-foreground">Your Locked Tokens</h2>
                <Link 
                  href="/"
                  className="text-base-blue hover:text-base-blue-light font-medium transition-colors"
                >
                  + Create New Lock
                </Link>
              </div>
              
              <ActiveLocks onClaimSuccess={handleClaimSuccess} />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-gradient-to-r from-base-blue to-base-blue-dark rounded-xl p-6 text-white shadow-xl animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Ready to lock more tokens?</h3>
                  <p className="opacity-90">
                    Strengthen your diamond hands by locking more tokens for the long term.
                  </p>
                </div>
                <Link 
                  href="/"
                  className="inline-flex touch-target px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg hover:bg-white/20 font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Lock More Tokens
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="card glass backdrop-blur-xl p-12 text-center animate-scale-in">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Connect Your Wallet</h2>
            <p className="text-foreground-secondary mb-8 max-w-md mx-auto">
              Connect your wallet to view and manage your locked tokens. Your dashboard awaits!
            </p>
            <div className="flex justify-center">
              {mounted && (
                <button
                  onClick={requireAuth}
                  className="px-6 py-3 bg-gradient-to-r from-base-blue to-base-blue-dark text-white rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all transform font-semibold"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8 text-center text-sm text-foreground-tertiary">
        <p>Built with 💎🙌 on Base</p>
      </footer>
    </div>
  );
}