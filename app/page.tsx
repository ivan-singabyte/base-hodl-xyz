'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Token } from '@coinbase/onchainkit/token';
import { useAddFrame, useMiniKit } from '@coinbase/onchainkit/minikit';
import TokenSelector from './components/TokenSelector';
import DurationPicker from './components/DurationPicker';
import AmountInput from './components/AmountInput';
import dynamic from 'next/dynamic';
import { useAuth } from './contexts/AuthContext';
import { formatUnits } from 'viem';
import { UserProfile } from './components/UserProfile';

// Lazy load the LockConfirmation component
const LockConfirmation = dynamic(() => import('./components/LockConfirmation'), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-2">Loading...</p>
      </div>
    </div>
  ),
  ssr: false
});

export default function App() {
  const { isConnected, address } = useAccount();
  const { requireAuth } = useAuth();
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [mounted, setMounted] = useState(false);
  const [frameAdded, setFrameAdded] = useState(false);

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<bigint | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [amountWei, setAmountWei] = useState<bigint>(BigInt(0));
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lockSuccess, setLockSuccess] = useState(false);

  const addFrame = useAddFrame();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set frame ready if not already set
    if (!isFrameReady && setFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const { data: tokenBalance } = useBalance({
    address: address,
    token: selectedToken?.address as `0x${string}` | undefined,
  });

  const maxAmount = tokenBalance 
    ? formatUnits(tokenBalance.value, tokenBalance.decimals)
    : '0';

  const handleAmountChange = (newAmount: string, newAmountWei: bigint) => {
    setAmount(newAmount);
    setAmountWei(newAmountWei);
  };

  const handleLockClick = () => {
    if (!isConnected) {
      requireAuth();
      return;
    }
    
    if (selectedToken && selectedDuration && amountWei > BigInt(0)) {
      setShowConfirmation(true);
    }
  };

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="text-base-blue hover:text-base-blue/80 px-4 py-2 rounded-lg border border-base-blue/20 hover:border-base-blue/40 transition-colors text-sm font-medium"
        >
          Save Frame
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
          <span>✓ Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  const handleLockSuccess = () => {
    // Close modal immediately
    setShowConfirmation(false);
    // Show success message
    setLockSuccess(true);
    // Reset form after showing success
    setTimeout(() => {
      setSelectedToken(null);
      setSelectedDuration(null);
      setAmount('');
      setAmountWei(BigInt(0));
      setLockSuccess(false);
    }, 3000);
  };

  const isFormValid = selectedToken && selectedDuration && amountWei > BigInt(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-blue/5 via-background to-base-blue/10">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container-responsive py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-base-blue to-base-blue-dark flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold bg-gradient-to-r from-base-blue to-base-blue-dark bg-clip-text text-transparent">
                HODL Vault
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {saveFrameButton}
              {mounted && isConnected && <UserProfile />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="card glass backdrop-blur-xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Lock Your Tokens</h2>
              <p className="text-foreground-secondary">
                Diamond hands mode: Lock any ERC-20 token with no early withdrawal
              </p>
            </div>

            {lockSuccess && (
              <div className="bg-success-light border border-success/20 p-4 rounded-lg animate-slide-down">
                <p className="text-success font-medium text-center flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Tokens locked successfully!
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Step 1: Select Token */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-base-blue/10 text-xs font-bold text-base-blue">1</span>
                  <span className="text-sm font-medium text-foreground-secondary">Select Token</span>
                </div>
                <TokenSelector 
                  onTokenSelect={setSelectedToken}
                  selectedToken={selectedToken}
                />
              </div>

              {/* Step 2: Select Duration */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-base-blue/10 text-xs font-bold text-base-blue">2</span>
                  <span className="text-sm font-medium text-foreground-secondary">Choose Duration</span>
                </div>
                <DurationPicker 
                  onDurationSelect={setSelectedDuration}
                  selectedDuration={selectedDuration}
                />
              </div>

              {/* Step 3: Enter Amount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-base-blue/10 text-xs font-bold text-base-blue">3</span>
                  <span className="text-sm font-medium text-foreground-secondary">Enter Amount</span>
                </div>
                <AmountInput 
                  onAmountChange={handleAmountChange}
                  maxAmount={maxAmount}
                  selectedToken={selectedToken}
                />
              </div>

              {/* Lock Button */}
              <button
                onClick={handleLockClick}
                disabled={mounted && isConnected ? !isFormValid : false}
                className={`
                  w-full touch-target py-4 px-6 rounded-xl font-semibold text-lg
                  transition-all duration-base transform
                  ${!mounted || (!isConnected || isFormValid)
                    ? 'bg-gradient-to-r from-base-blue to-base-blue-dark text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-lg' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                  focus-ring
                `}
                aria-label={!mounted ? 'Loading' : (isConnected ? 'Lock selected tokens' : 'Connect wallet to lock tokens')}
              >
                {!mounted ? 'Loading...' : (isConnected ? 'Lock Tokens' : 'Connect Wallet to Lock')}
              </button>
            </div>

            {/* Info Section */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-base-blue/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-base-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-foreground-secondary space-y-1">
                  <p>• Low transaction fees on Base network</p>
                  <p>• Tokens are 100% locked until unlock date</p>
                  <p>• Share your diamond hands achievement on Farcaster</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Link */}
          <div className="text-center mt-6">
            <a 
              href="/dashboard" 
              className="inline-flex touch-target items-center justify-center gap-2 px-6 py-3 
                       bg-gradient-to-r from-base-blue/10 to-base-blue/20 
                       border border-base-blue/30 text-base-blue 
                       rounded-lg font-semibold transition-all duration-base
                       hover:from-base-blue/20 hover:to-base-blue/30 hover:border-base-blue/50
                       hover:shadow-lg hover:shadow-base-blue/20
                       transform hover:scale-[1.02] active:scale-[0.98] focus-ring"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Dashboard
            </a>
          </div>
        </div>
      </main>

      {/* Lock Confirmation Modal */}
      {showConfirmation && selectedToken && selectedDuration && (
        <LockConfirmation
          token={selectedToken}
          amount={amount}
          amountWei={amountWei}
          duration={selectedDuration}
          onSuccess={handleLockSuccess}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}