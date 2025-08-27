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

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;

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

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: lock, data: lockHash } = useWriteContract();

  const { isLoading: isApprovalPending } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isLockPending, isSuccess: isLockSuccess } = useWaitForTransactionReceipt({
    hash: lockHash,
  });

  const unlockDate = addSeconds(new Date(), Number(duration));

  const handleApprove = async () => {
    if (!address || !VAULT_ADDRESS) return;
    
    setIsApproving(true);
    clearError();
    try {
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
    } catch (err) {
      console.error('Approval failed:', err);
      handleError(err, handleApprove);
      setIsApproving(false);
    }
  };

  const handleLock = useCallback(async () => {
    if (!address || !VAULT_ADDRESS || hasTriggeredLock) return;

    setIsLocking(true);
    setHasTriggeredLock(true);
    clearError();
    try {
      lock({
        address: VAULT_ADDRESS,
        abi: HodlVaultABI.abi,
        functionName: 'lockTokens',
        args: [token.address, amountWei, duration],
      });
    } catch (err) {
      console.error('Lock failed:', err);
      handleError(err, () => {
        setHasTriggeredLock(false);
        return handleLock();
      });
      setIsLocking(false);
      setHasTriggeredLock(false);
    }
  }, [address, hasTriggeredLock, lock, token.address, amountWei, duration, clearError, handleError]);

  // Auto-proceed after approval
  useEffect(() => {
    if (approveHash && !isApprovalPending && !lockHash && !hasTriggeredLock) {
      handleLock();
    }
  }, [approveHash, isApprovalPending, lockHash, hasTriggeredLock, handleLock]);

  // Handle success
  useEffect(() => {
    if (isLockSuccess && !hasTriggeredSuccess) {
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