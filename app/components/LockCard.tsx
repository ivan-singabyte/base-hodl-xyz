'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { type Token, TokenImage } from '@coinbase/onchainkit/token';
import Countdown from './Countdown';
import ShareButton from './ShareButton';
import HodlVaultABI from '../../artifacts/contracts/HodlVault.sol/HodlVault.json';
import { KNOWN_BASE_SEPOLIA_TOKENS, fetchTokenByAddress } from '@/app/lib/tokenService';

interface Lock {
  token: `0x${string}`;
  amount: bigint;
  lockTime: bigint;
  unlockTime: bigint;
  claimed: boolean;
}

interface LockCardProps {
  lock: Lock;
  lockIndex: number;
  onClaimSuccess?: () => void;
}

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;

export default function LockCard({ lock, lockIndex, onClaimSuccess }: LockCardProps) {
  const [isClaimable, setIsClaimable] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<Partial<Token>>({
    symbol: 'TOKEN',
    decimals: 18,
    name: 'Unknown Token',
  });
  
  const chainId = useChainId();
  const { writeContract: claim, data: claimHash } = useWriteContract();
  const { isLoading: isClaimPending, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Get token info on mount
  useEffect(() => {
    const getTokenInfo = async () => {
      // For Base Sepolia, check the known tokens list
      if (chainId === baseSepolia.id) {
        const knownToken = KNOWN_BASE_SEPOLIA_TOKENS[lock.token.toLowerCase()];
        if (knownToken) {
          setTokenInfo(knownToken);
          return;
        }
      }
      
      // For Base mainnet, fetch from API
      const apiToken = await fetchTokenByAddress(lock.token);
      if (apiToken) {
        setTokenInfo(apiToken);
      }
    };
    
    getTokenInfo();
  }, [lock.token, chainId]);

  // Token object creation removed - using tokenInfo directly

  useEffect(() => {
    const checkClaimable = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      setIsClaimable(now >= lock.unlockTime);
    };

    checkClaimable();
    const interval = setInterval(checkClaimable, 1000);
    return () => clearInterval(interval);
  }, [lock.unlockTime]);

  useEffect(() => {
    if (isClaimSuccess) {
      onClaimSuccess?.();
      setIsClaiming(false);
    }
  }, [isClaimSuccess, onClaimSuccess]);

  const handleClaim = async () => {
    if (!isClaimable || isClaiming) return;
    
    setIsClaiming(true);
    try {
      claim({
        address: VAULT_ADDRESS,
        abi: HodlVaultABI.abi,
        functionName: 'claimTokens',
        args: [BigInt(lockIndex)],
      });
    } catch (error) {
      console.error('Claim failed:', error);
      setIsClaiming(false);
    }
  };

  const formatAmount = (amount: bigint, decimals: number) => {
    const formatted = formatUnits(amount, decimals);
    const num = parseFloat(formatted);
    if (num < 0.01) return '<0.01';
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getDuration = () => {
    const seconds = Number(lock.unlockTime - lock.lockTime);
    const days = Math.floor(seconds / 86400);
    
    if (days >= 3650) return '10 years';
    if (days >= 1095) return '3 years';
    if (days >= 365) return '1 year';
    if (days >= 180) return '6 months';
    if (days >= 30) return '1 month';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const getProgress = () => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const total = lock.unlockTime - lock.lockTime;
    const elapsed = now - lock.lockTime;
    
    if (now >= lock.unlockTime) return 100;
    if (now <= lock.lockTime) return 0;
    
    return Number((elapsed * BigInt(100)) / total);
  };

  return (
    <div className="card glass backdrop-blur-xl border border-border hover:shadow-xl hover:shadow-base-blue/10 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <TokenImage token={tokenInfo as Token} size={40} />
          <div>
            <h3 className="font-semibold text-lg">{tokenInfo.symbol}</h3>
            <p className="text-sm text-foreground-secondary">{tokenInfo.name}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isClaimable 
            ? 'bg-success/20 text-success' 
            : 'bg-base-blue/20 text-base-blue'
        }`}>
          {isClaimable ? 'Claimable' : 'Locked'}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-sm text-foreground-secondary mb-1">Amount Locked</p>
        <p className="text-2xl font-bold text-foreground">
          {formatAmount(lock.amount, tokenInfo.decimals || 18)} {tokenInfo.symbol}
        </p>
      </div>

      {/* Duration & Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-foreground-secondary">Duration: {getDuration()}</span>
          <span className="font-medium">{getProgress().toFixed(1)}%</span>
        </div>
        <div className="w-full bg-background-tertiary rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isClaimable ? 'bg-success' : 'bg-base-blue'
            }`}
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-foreground-secondary">Locked</p>
          <p className="font-medium text-foreground">
            {new Date(Number(lock.lockTime) * 1000).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-foreground-secondary">Unlocks</p>
          <p className="font-medium text-foreground">
            {new Date(Number(lock.unlockTime) * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Countdown or Claim Button */}
      <div className="pt-4 border-t border-border">
        {isClaimable ? (
          <div className="space-y-3">
            <button
              onClick={handleClaim}
              disabled={isClaiming || isClaimPending}
              className={`w-full touch-target py-3 px-4 rounded-lg font-semibold transition-all transform focus-ring
                ${isClaiming || isClaimPending
                  ? 'bg-background-tertiary text-foreground-tertiary cursor-not-allowed'
                  : 'bg-gradient-to-r from-success to-success/80 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {isClaimPending ? 'Claiming...' : 'Claim Tokens'}
            </button>
            <ShareButton
              tokenSymbol={tokenInfo.symbol || 'TOKEN'}
              amount={formatAmount(lock.amount, tokenInfo.decimals || 18)}
              duration={String((Number(lock.unlockTime - lock.lockTime)) / 86400)}
              unlockDate={new Date(Number(lock.unlockTime) * 1000)}
              lockId={lockIndex}
              variant="secondary"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <Countdown unlockTime={lock.unlockTime} />
            <ShareButton
              tokenSymbol={tokenInfo.symbol || 'TOKEN'}
              amount={formatAmount(lock.amount, tokenInfo.decimals || 18)}
              duration={String((Number(lock.unlockTime - lock.lockTime)) / 86400)}
              unlockDate={new Date(Number(lock.unlockTime) * 1000)}
              lockId={lockIndex}
              variant="secondary"
            />
          </div>
        )}
      </div>
    </div>
  );
}