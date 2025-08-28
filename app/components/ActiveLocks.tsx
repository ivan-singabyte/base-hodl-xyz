'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';
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

// Clean the vault address - remove any whitespace or newlines
const rawVaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '';
const VAULT_ADDRESS = rawVaultAddress.trim().replace(/\s+/g, '').replace(/\n/g, '') as `0x${string}`;

export default function ActiveLocks({ onClaimSuccess }: ActiveLocksProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [locks, setLocks] = useState<Lock[]>([]);
  const [lockIds, setLockIds] = useState<Map<number, bigint>>(new Map());
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

  // Fetch lock IDs from events when locks are loaded
  useEffect(() => {
    const fetchLockIds = async () => {
      if (!publicClient || !address || !locks.length) return;
      
      try {
        console.log('[ActiveLocks] Fetching lock IDs for user:', address);
        
        // Get LockCreated events for this user
        const logs = await publicClient.getLogs({
          address: VAULT_ADDRESS,
          event: parseAbiItem('event LockCreated(uint256 indexed lockId, address indexed user, address indexed token, uint256 amount, uint256 lockTime, uint256 unlockTime)'),
          args: {
            user: address,
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });
        
        console.log('[ActiveLocks] Found', logs.length, 'LockCreated events');
        
        // Create a mapping of lock index to lock ID
        const idMap = new Map<number, bigint>();
        
        // Sort logs by block number and log index to maintain creation order
        const sortedLogs = [...logs].sort((a, b) => {
          if (a.blockNumber !== b.blockNumber) {
            return Number(a.blockNumber - b.blockNumber);
          }
          return Number(a.logIndex - b.logIndex);
        });
        
        // Map each lock to its ID based on the order they were created
        sortedLogs.forEach((log, index) => {
          if (log.args && 'lockId' in log.args) {
            const lockId = log.args.lockId as bigint;
            idMap.set(index, lockId);
            console.log(`[ActiveLocks] Lock at index ${index} has ID ${lockId}`);
          }
        });
        
        setLockIds(idMap);
      } catch (error) {
        console.error('[ActiveLocks] Error fetching lock IDs:', error);
      }
    };
    
    fetchLockIds();
  }, [publicClient, address, locks]);

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
        {activeLocks.map((lock, index) => {
          // Find the actual lock ID for this lock
          // We need to find the index in the full (unfiltered) locks array
          const fullIndex = locks.findIndex(l => l === lock);
          const actualLockId = lockIds.get(fullIndex);
          
          console.log(`[ActiveLocks] Rendering lock at fullIndex ${fullIndex} with ID ${actualLockId}`);
          
          return (
            <LockCard
              key={index}
              lock={lock}
              lockIndex={actualLockId !== undefined ? Number(actualLockId) : fullIndex}
              onClaimSuccess={() => {
                handleRefresh();
                onClaimSuccess?.();
              }}
            />
          );
        })}
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