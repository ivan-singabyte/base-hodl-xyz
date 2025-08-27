'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import LockCard from './LockCard';
import HodlVaultABI from '../../artifacts/contracts/HodlVault.sol/HodlVault.json';

interface Lock {
  token: `0x${string}`;
  amount: bigint;
  lockTime: bigint;
  unlockTime: bigint;
  claimed: boolean;
}

interface ActiveLocksProps {
  onClaimSuccess?: () => void;
}

const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;

export default function ActiveLocks({ onClaimSuccess }: ActiveLocksProps) {
  const { address } = useAccount();
  const [locks, setLocks] = useState<Lock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user's locks from contract
  const { data: userLocks, isLoading: locksLoading, refetch } = useReadContract({
    address: VAULT_ADDRESS,
    abi: HodlVaultABI.abi,
    functionName: 'getUserLocks',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (userLocks) {
      setLocks(userLocks as Lock[]);
      setIsLoading(false);
    } else if (!locksLoading) {
      setIsLoading(false);
    }
  }, [userLocks, locksLoading]);

  const handleRefresh = () => {
    refetch();
  };

  // Filter out claimed locks for active view
  const activeLocks = locks.filter(lock => !lock.claimed);
  const claimableLocks = activeLocks.filter(lock => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now >= lock.unlockTime;
  });

  if (!address) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground-secondary">Connect your wallet to view your locks</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-base-blue border-r-transparent"></div>
        <p className="mt-2 text-foreground-secondary">Loading your locks...</p>
      </div>
    );
  }

  if (activeLocks.length === 0) {
    return (
      <div className="text-center py-12 bg-background-secondary rounded-xl border border-border">
        <div className="text-6xl mb-4">🔓</div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">No Active Locks</h3>
        <p className="text-foreground-secondary mb-6">
          You don&apos;t have any active locks yet. Lock your tokens to start earning diamond hands status!
        </p>
        <Link 
          href="/"
          className="inline-flex px-6 py-3 bg-gradient-to-r from-base-blue to-base-blue-dark text-white rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all transform"
        >
          Create Your First Lock
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-background-secondary p-4 rounded-lg border border-border">
          <p className="text-sm text-foreground-secondary">Active Locks</p>
          <p className="text-2xl font-bold text-foreground">{activeLocks.length}</p>
        </div>
        <div className="bg-background-secondary p-4 rounded-lg border border-border">
          <p className="text-sm text-foreground-secondary">Claimable</p>
          <p className="text-2xl font-bold text-success">{claimableLocks.length}</p>
        </div>
        <div className="bg-background-secondary p-4 rounded-lg border border-border">
          <p className="text-sm text-foreground-secondary">Next Unlock</p>
          <p className="text-sm font-medium text-foreground">
            {activeLocks.length > 0 ? (
              new Date(Number(
                activeLocks.reduce((min, lock) => 
                  lock.unlockTime < min ? lock.unlockTime : min, 
                  activeLocks[0].unlockTime
                ) 
              ) * 1000).toLocaleDateString()
            ) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Locks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeLocks.map((lock, index) => (
          <LockCard
            key={index}
            lock={lock}
            lockIndex={index}
            onClaimSuccess={() => {
              handleRefresh();
              onClaimSuccess?.();
            }}
          />
        ))}
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleRefresh}
          className="text-base-blue hover:text-base-blue-light font-medium transition-colors"
        >
          Refresh Locks
        </button>
      </div>
    </div>
  );
}