'use client';

import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient } from 'wagmi';
import { type Token, TokenImage } from '@coinbase/onchainkit/token';
import { erc20Abi } from 'viem';
import Countdown from './Countdown';
import ShareButton from './ShareButton';
import HodlVaultABI from '../../artifacts/contracts/HodlVault.sol/HodlVault.json';
import { 
  fetchTokenByAddress, 
  KNOWN_BASE_SEPOLIA_TOKENS,
  POPULAR_BASE_TOKENS 
} from '@/app/lib/tokenService';
import { baseSepolia, base } from 'viem/chains';

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

// Clean the vault address - remove any whitespace or newlines
const rawVaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '';
const VAULT_ADDRESS = rawVaultAddress.trim().replace(/\s+/g, '').replace(/\n/g, '') as `0x${string}`;

export default function LockCard({ lock, lockIndex, onClaimSuccess }: LockCardProps) {
  const [isClaimable, setIsClaimable] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<Token>({
    address: lock.token,
    chainId: 1,
    symbol: 'TOKEN',
    decimals: 18,
    name: 'Unknown Token',
    image: null,
  });
  
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  const { writeContract: claim, data: claimHash } = useWriteContract();
  const { isLoading: isClaimPending, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Get token info on mount - using same approach as TokenSelector
  useEffect(() => {
    const getTokenInfo = async () => {
      console.log('[LockCard] Fetching token info for:', lock.token, 'on chain:', chainId);
      
      try {
        const normalizedAddress = lock.token.toLowerCase();
        
        // First check known token lists (same as TokenSelector)
        if (chainId === baseSepolia.id) {
          const knownToken = KNOWN_BASE_SEPOLIA_TOKENS.find(
            t => t.address.toLowerCase() === normalizedAddress
          );
          if (knownToken) {
            console.log('[LockCard] Found in known testnet tokens');
            setTokenInfo(knownToken);
            return;
          }
        } else if (chainId === base.id) {
          const popularToken = POPULAR_BASE_TOKENS.find(
            t => t.address.toLowerCase() === normalizedAddress
          );
          if (popularToken) {
            console.log('[LockCard] Found in popular mainnet tokens');
            setTokenInfo(popularToken);
            return;
          }
        }
        
        // Try to fetch from API (with proper timeout)
        console.log('[LockCard] Attempting API fetch');
        const apiToken = await fetchTokenByAddress(lock.token, chainId);
        if (apiToken) {
          console.log('[LockCard] Found via API:', apiToken);
          setTokenInfo(apiToken);
          return;
        }
        
        // Detect if we're in Coinbase app
        const isCoinbaseApp = typeof window !== 'undefined' && (
          /CoinbaseWallet/i.test(navigator.userAgent) || 
          (window.ethereum && 'isCoinbaseWallet' in window.ethereum)
        );
        
        console.log('[LockCard] Coinbase app detected:', isCoinbaseApp);
        
        // If not found, create minimal token (skip blockchain reads in Coinbase app)
        console.log('[LockCard] Creating minimal token object');
        let symbol = 'TOKEN';
        let name = 'Unknown Token';
        let decimals = 18;
        
        // Only try blockchain reads on desktop (not in Coinbase app)
        if (!isCoinbaseApp && publicClient) {
          try {
            console.log('[LockCard] Attempting blockchain reads (desktop only)');
            
            // Try to get symbol with very short timeout
            const symbolPromise = publicClient.readContract({
              address: lock.token,
              abi: erc20Abi,
              functionName: 'symbol',
            }) as Promise<string>;
            
            symbol = await Promise.race([
              symbolPromise,
              new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 1000)
              )
            ]).catch(() => 'TOKEN');
            
            console.log('[LockCard] Got symbol:', symbol);
            
            // Try to get decimals with very short timeout
            const decimalsPromise = publicClient.readContract({
              address: lock.token,
              abi: erc20Abi,
              functionName: 'decimals',
            }) as Promise<number>;
            
            decimals = await Promise.race([
              decimalsPromise,
              new Promise<number>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 1000)
              )
            ]).catch(() => 18);
            
            console.log('[LockCard] Got decimals:', decimals);
            
            // Try to get name with very short timeout
            const namePromise = publicClient.readContract({
              address: lock.token,
              abi: erc20Abi,
              functionName: 'name',
            }) as Promise<string>;
            
            name = await Promise.race([
              namePromise,
              new Promise<string>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 1000)
              )
            ]).catch(() => symbol || 'Unknown Token');
            
            console.log('[LockCard] Got name:', name);
          } catch (err) {
            console.warn('[LockCard] Error reading contract data:', err);
          }
        } else if (isCoinbaseApp) {
          console.log('[LockCard] Skipping blockchain reads in Coinbase app');
        }
        
        // Create Token object with null image (let TokenImage handle fallback)
        const token: Token = {
          address: lock.token,
          chainId: chainId,
          name: name,
          symbol: symbol,
          decimals: decimals,
          // Use null instead of external URL - TokenImage will handle the fallback
          image: null,
        };
        
        console.log('[LockCard] Created token object:', token);
        setTokenInfo(token);
        
      } catch (error) {
        console.error('[LockCard] Error fetching token info:', error);
        
        // Final fallback with null image
        const fallbackToken: Token = {
          address: lock.token,
          chainId: chainId,
          name: 'Unknown Token',
          symbol: 'TOKEN',
          decimals: 18,
          // Use null instead of external URL
          image: null,
        };
        setTokenInfo(fallbackToken);
      }
    };
    
    getTokenInfo();
  }, [lock.token, chainId, publicClient]);

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
          <TokenImage token={tokenInfo} size={40} />
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
          {formatAmount(lock.amount, tokenInfo.decimals)} {tokenInfo.symbol}
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
              tokenSymbol={tokenInfo.symbol}
              amount={formatAmount(lock.amount, tokenInfo.decimals)}
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
              tokenSymbol={tokenInfo.symbol}
              amount={formatAmount(lock.amount, tokenInfo.decimals)}
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