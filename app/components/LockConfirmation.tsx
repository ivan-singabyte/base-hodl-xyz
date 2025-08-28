'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { Token } from '@coinbase/onchainkit/token';
import { format, addSeconds } from 'date-fns';
import HodlVaultABI from '../../artifacts/contracts/HodlVault.sol/HodlVault.json';
import ShareButton from './ShareButton';
import { useErrorHandler, ErrorDisplay } from '../hooks/useErrorHandler';
import { RetryStatus } from '../hooks/useRetry';

interface LockConfirmationProps {
  token: Token;
  amount: string;
  amountWei: bigint;
  duration: bigint;
  onSuccess: () => void;
  onCancel: () => void;
}

// Clean the vault address - remove any whitespace or newlines
const rawVaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '';
const VAULT_ADDRESS = rawVaultAddress.trim().replace(/\s+/g, '').replace(/\n/g, '') as `0x${string}`;

// Log the vault address for debugging
if (typeof window !== 'undefined') {
  console.log('VAULT_ADDRESS from env:', process.env.NEXT_PUBLIC_VAULT_ADDRESS);
  console.log('Cleaned VAULT_ADDRESS:', VAULT_ADDRESS);
}

export default function LockConfirmation({
  token,
  amount,
  amountWei,
  duration,
  onSuccess,
  onCancel,
}: LockConfirmationProps) {
  const { address } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [hasTriggeredLock, setHasTriggeredLock] = useState(false);
  const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false);
  const { error, isRetrying, handleError, clearError } = useErrorHandler();
  const [showSuccessWithShare, setShowSuccessWithShare] = useState(false);

  const { 
    writeContract: approve, 
    data: approveHash,
    error: approveError,
    isError: isApproveError 
  } = useWriteContract();
  
  const { 
    writeContract: lock, 
    data: lockHash,
    error: lockError,
    isError: isLockError
  } = useWriteContract();

  const { isLoading: isApprovalPending, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isLockPending, isSuccess: isLockSuccess } = useWaitForTransactionReceipt({
    hash: lockHash,
  });

  const unlockDate = addSeconds(new Date(), Number(duration));

  const handleApprove = useCallback(() => {
    if (!address) {
      console.error('No wallet address connected');
      handleError(new Error('Please connect your wallet'), async () => handleApprove());
      return;
    }
    
    if (!VAULT_ADDRESS || !VAULT_ADDRESS.startsWith('0x')) {
      console.error('Invalid or missing VAULT_ADDRESS:', VAULT_ADDRESS);
      handleError(new Error('Vault address not configured. Please check environment variables.'), async () => handleApprove());
      return;
    }
    
    setIsApproving(true);
    clearError();
    
    console.log('Initiating approval...', {
      tokenAddress: token.address,
      vaultAddress: VAULT_ADDRESS,
      amount: amountWei.toString()
    });
    
    // Approve token spending
    approve({
      address: token.address as `0x${string}`,
      abi: [
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'approve',
      args: [VAULT_ADDRESS, amountWei],
    });
  }, [address, token.address, amountWei, approve, clearError, handleError]);

  const handleLock = useCallback(() => {
    if (!address) {
      console.error('No wallet address connected');
      return;
    }
    
    if (!VAULT_ADDRESS || !VAULT_ADDRESS.startsWith('0x')) {
      console.error('Invalid or missing VAULT_ADDRESS:', VAULT_ADDRESS);
      return;
    }
    
    if (hasTriggeredLock) {
      console.error('Lock already triggered');
      return;
    }

    setIsLocking(true);
    setHasTriggeredLock(true);
    clearError();
    
    console.log('Initiating lock...', {
      vaultAddress: VAULT_ADDRESS,
      tokenAddress: token.address,
      amount: amountWei.toString(),
      duration: duration.toString()
    });
    
    // Lock tokens
    lock({
      address: VAULT_ADDRESS,
      abi: HodlVaultABI.abi,
      functionName: 'lockTokens',
      args: [token.address, amountWei, duration],
    });
  }, [address, hasTriggeredLock, lock, token.address, amountWei, duration, clearError]);

  // Handle approval errors
  useEffect(() => {
    if (isApproveError && approveError) {
      console.error('Approval transaction error:', approveError);
      handleError(approveError, async () => handleApprove());
      setIsApproving(false);
    }
  }, [isApproveError, approveError, handleError]);
  
  // Handle lock errors
  useEffect(() => {
    if (isLockError && lockError) {
      console.error('Lock transaction error:', lockError);
      handleError(lockError, async () => {
        setHasTriggeredLock(false);
        handleLock();
      });
      setIsLocking(false);
      setHasTriggeredLock(false);
    }
  }, [isLockError, lockError, handleError]);
  
  // Auto-proceed after approval success
  useEffect(() => {
    if (isApprovalSuccess && !lockHash && !hasTriggeredLock) {
      console.log('Approval successful, proceeding to lock...');
      // Small delay to ensure approval is confirmed
      const timer = setTimeout(() => {
        handleLock();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isApprovalSuccess, lockHash, hasTriggeredLock, handleLock]);

  // Monitor approval hash
  useEffect(() => {
    if (approveHash) {
      console.log('Approval transaction hash:', approveHash);
    }
  }, [approveHash]);
  
  // Monitor lock hash
  useEffect(() => {
    if (lockHash) {
      console.log('Lock transaction hash:', lockHash);
    }
  }, [lockHash]);
  
  // Handle success
  useEffect(() => {
    if (isLockSuccess && !hasTriggeredSuccess) {
      console.log('Lock successful!');
      setHasTriggeredSuccess(true);
      setShowSuccessWithShare(true);
    }
  }, [isLockSuccess, hasTriggeredSuccess]);

  if (showSuccessWithShare) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background-secondary rounded-xl max-w-md w-full p-6 space-y-6 border border-border shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Lock Successful! 🎉</h2>
            <p className="text-foreground-secondary mb-4">
              Your {amount} {token.symbol} is now locked until {format(unlockDate, 'PPP')}
            </p>
          </div>

          <div className="bg-gradient-to-r from-base-blue/10 to-base-blue/20 rounded-lg p-4 border border-base-blue/30">
            <p className="text-sm text-foreground text-center">
              💎 Diamond hands activated! No early withdrawals allowed.
            </p>
          </div>

          <div className="space-y-3">
            <ShareButton
              tokenSymbol={token.symbol}
              amount={amount}
              duration={String(Number(duration) / 86400)}
              unlockDate={unlockDate}
              variant="primary"
              navigateToDashboard={true}
              onShare={() => {
                setShowSuccessWithShare(false);
                onSuccess();
              }}
            />
            
            <button
              onClick={() => {
                setShowSuccessWithShare(false);
                onSuccess();
                // Navigate to dashboard
                window.location.href = '/dashboard';
              }}
              className="w-full px-4 py-2 border border-border text-foreground-secondary rounded-lg hover:bg-background-tertiary transition-colors"
            >
              Skip & Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary rounded-xl max-w-md w-full p-6 space-y-6 border border-border shadow-2xl">
        <h2 className="text-2xl font-bold text-foreground">Confirm Lock</h2>

        <div className="space-y-4 bg-background p-4 rounded-lg border border-border">
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Token:</span>
            <span className="font-medium text-foreground">{token.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Amount:</span>
            <span className="font-medium text-foreground">{amount} {token.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Lock Duration:</span>
            <span className="font-medium text-foreground">
              {Number(duration) / 86400} days
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-secondary">Unlock Date:</span>
            <span className="font-medium text-foreground">
              {format(unlockDate, 'PPP')}
            </span>
          </div>
        </div>

        <ErrorDisplay 
          error={error} 
          onDismiss={clearError}
        />
        
        <RetryStatus 
          isRetrying={isRetrying} 
          attempt={0}
          onCancel={clearError}
        />

        {!VAULT_ADDRESS && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-sm text-red-700">
              ❌ <strong>Error:</strong> Vault contract address is not configured. 
              Please set NEXT_PUBLIC_VAULT_ADDRESS environment variable.
            </p>
          </div>
        )}

        <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg">
          <p className="text-sm text-warning">
            ⚠️ <strong>Warning:</strong> Once locked, tokens cannot be withdrawn until the unlock date. 
            There is no way to withdraw early.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isApproving || isLocking || isApprovalPending || isLockPending}
            className="flex-1 touch-target py-3 px-4 border border-border text-foreground rounded-lg
                     hover:bg-background-tertiary hover:border-border-strong transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
          >
            Cancel
          </button>
          
          {!approveHash ? (
            <button
              onClick={handleApprove}
              disabled={isApproving || !VAULT_ADDRESS}
              className="flex-1 touch-target py-3 px-4 bg-base-blue text-white rounded-lg
                       hover:bg-base-blue-dark transition-all transform hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
            >
              {isApproving ? 'Approving...' : 'Approve & Lock'}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 touch-target py-3 px-4 bg-base-blue text-white rounded-lg
                       opacity-50 cursor-not-allowed"
            >
              {isApprovalPending ? 'Approving...' : 
               isLockPending ? 'Locking...' : 
               'Processing...'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}