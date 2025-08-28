'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { Token, TokenImage } from '@coinbase/onchainkit/token';
import HodlVaultABI from '../../artifacts/contracts/HodlVault.sol/HodlVault.json';

interface ClaimFlowProps {
  lockId: number;
  token: Token;
  amount: bigint;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Clean the vault address - remove any whitespace or newlines
const rawVaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '';
const VAULT_ADDRESS = rawVaultAddress.trim().replace(/\s+/g, '').replace(/\n/g, '') as `0x${string}`;

export default function ClaimFlow({ 
  lockId, 
  token, 
  amount, 
  onSuccess, 
  onCancel 
}: ClaimFlowProps) {
  const [isClaimTriggered, setIsClaimTriggered] = useState(false);
  const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { writeContract: claim, data: claimHash } = useWriteContract();
  const { isLoading: isClaimPending, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  useEffect(() => {
    if (isClaimSuccess && !hasTriggeredSuccess) {
      setHasTriggeredSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000); // Show success state for 2 seconds
    }
  }, [isClaimSuccess, hasTriggeredSuccess, onSuccess]);

  const handleClaim = async () => {
    if (isClaimTriggered) return;
    
    setIsClaimTriggered(true);
    setError(null);
    
    try {
      claim({
        address: VAULT_ADDRESS,
        abi: HodlVaultABI.abi,
        functionName: 'claimTokens',
        args: [BigInt(lockId)],
      });
    } catch (error) {
      console.error('Claim failed:', error);
      setError((error as Error)?.message || 'Failed to claim tokens');
      setIsClaimTriggered(false);
    }
  };

  const formatAmount = (amt: bigint, decimals: number) => {
    const formatted = formatUnits(amt, decimals);
    const num = parseFloat(formatted);
    if (num < 0.01) return '<0.01';
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (isClaimSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Tokens Claimed!</h2>
          <p className="text-gray-600 mb-4">
            You have successfully claimed your tokens
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-3">
              <TokenImage token={token} size={32} />
              <span className="text-xl font-bold text-green-800">
                {formatAmount(amount, token.decimals)} {token.symbol}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Your tokens have been transferred to your wallet.</p>
            <p className="font-medium mt-2">Congratulations on your diamond hands! 💎🙌</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6">
        <h2 className="text-2xl font-bold">Claim Your Tokens</h2>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Token:</span>
            <div className="flex items-center gap-2">
              <TokenImage token={token} size={24} />
              <span className="font-medium">{token.symbol}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">
              {formatAmount(amount, token.decimals)} {token.symbol}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-sm text-red-800">❌ {error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ Your tokens will be transferred directly to your connected wallet.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isClaimTriggered || isClaimPending}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handleClaim}
            disabled={isClaimTriggered || isClaimPending}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 
                     text-white rounded-lg hover:from-green-700 hover:to-green-800 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaimPending ? 'Claiming...' : 'Claim Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
}