'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatFarcasterShare, getWarpcastShareUrl } from '@/app/lib/farcaster'
import sdk from '@farcaster/miniapp-sdk'
import { useMiniKit } from '../providers/MiniKitProvider'

interface ShareButtonProps {
  tokenSymbol: string
  amount: string
  duration: string
  unlockDate: Date
  lockId?: number
  variant?: 'primary' | 'secondary'
  onShare?: () => void
  navigateToDashboard?: boolean
}

export default function ShareButton({
  tokenSymbol,
  amount,
  duration,
  unlockDate,
  variant = 'primary',
  onShare,
  navigateToDashboard = false
}: ShareButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const { isInMiniApp, isSDKReady } = useMiniKit()
  
  const formatDuration = (durationStr: string) => {
    const durationMap: { [key: string]: string } = {
      '30': '1 month',
      '180': '6 months',
      '365': '1 year',
      '1095': '3 years',
      '3650': '10 years',
      '1': '1 day' // Test duration
    }
    return durationMap[durationStr] || `${durationStr} days`
  }
  
  const shareText = formatFarcasterShare({
    tokenSymbol,
    amount,
    duration: formatDuration(duration),
  })

  // Get the vault contract address and chain info
  const vaultAddress = process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x71Da6632aD3De77677E82202853889bFC5028989'
  const isMainnet = process.env.NEXT_PUBLIC_CHAIN === 'base'
  const explorerUrl = isMainnet 
    ? `https://basescan.org/address/${vaultAddress}`
    : `https://sepolia.basescan.org/address/${vaultAddress}`
  
  // Use the contract explorer URL as the share URL
  const shareUrl = explorerUrl

  const handlePostShare = () => {
    setShowModal(false)
    onShare?.()
    
    // Navigate to dashboard if requested
    if (navigateToDashboard) {
      router.push('/dashboard')
    }
  }

  const handleFarcasterShare = async () => {
    try {
      // Use MiniKit SDK action if available
      if (isInMiniApp && isSDKReady && sdk.actions) {
        // Use SDK's compose cast action for cross-client compatibility
        await sdk.actions.openUrl(getWarpcastShareUrl(shareText, [shareUrl]));
      } else {
        // Fallback to window.open for non-Mini App contexts
        const farcasterUrl = getWarpcastShareUrl(shareText, [shareUrl])
        window.open(farcasterUrl, '_blank')
      }
      
      handlePostShare()
    } catch (error) {
      console.error('Failed to share on Farcaster:', error)
      // Fallback to window.open
      const farcasterUrl = getWarpcastShareUrl(shareText, [shareUrl])
      window.open(farcasterUrl, '_blank')
      handlePostShare()
    }
  }

  const handleTwitterShare = async () => {
    const twitterText = `${shareText}\n\n${shareUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`
    
    try {
      // Use MiniKit SDK action if available
      if (isInMiniApp && isSDKReady && sdk.actions) {
        await sdk.actions.openUrl(twitterUrl);
      } else {
        window.open(twitterUrl, '_blank')
      }
      
      handlePostShare()
    } catch (error) {
      console.error('Failed to share on Twitter:', error)
      // Fallback to window.open
      window.open(twitterUrl, '_blank')
      handlePostShare()
    }
  }

  const handleShareClick = () => {
    setShowModal(true)
  }

  const handleSkip = () => {
    setShowModal(false)
    onShare?.()
    
    // Navigate to dashboard if requested
    if (navigateToDashboard) {
      router.push('/dashboard')
    }
  }

  const handlePlatformSelect = (platform: 'farcaster' | 'x') => {
    if (platform === 'farcaster') {
      handleFarcasterShare()
    } else {
      handleTwitterShare()
    }
  }

  return (
    <>
      <button
        onClick={handleShareClick}
        className={`
          ${variant === 'primary' 
            ? 'bg-gradient-to-r from-base-blue to-base-blue-dark text-white hover:shadow-lg w-full' 
            : 'bg-background-secondary text-foreground hover:bg-background-tertiary w-full'
          } 
          touch-target px-4 py-2 rounded-lg font-semibold transition-all duration-base 
          transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 focus-ring
        `}
        aria-label="Share your token lock achievement"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
        </svg>
        Share Achievement
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="card glass backdrop-blur-xl border border-border shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-xl font-display font-bold text-foreground mb-2">Share Your Diamond Hands! 💎</h2>
            </div>

            <div className="bg-gradient-to-r from-base-blue/10 to-base-blue-light/10 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Token:</span>
                  <span className="font-semibold text-foreground">{amount} {tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Duration:</span>
                  <span className="font-semibold text-foreground">{formatDuration(duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Unlock Date:</span>
                  <span className="font-semibold text-foreground">
                    {unlockDate instanceof Date && !isNaN(unlockDate.getTime()) 
                      ? unlockDate.toLocaleDateString() 
                      : 'Invalid date'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handlePlatformSelect('farcaster')}
                className="w-full touch-target px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 focus-ring"
                aria-label="Share on Farcaster"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>
                Share on Farcaster
              </button>

              <button
                onClick={() => handlePlatformSelect('x')}
                className="w-full touch-target px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 focus-ring"
                aria-label="Share on X"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-3 py-1.5 text-sm border border-border text-foreground-secondary rounded-lg hover:bg-background-secondary transition-colors focus-ring"
                aria-label="Skip sharing"
              >
                Skip
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-3 py-1.5 text-sm bg-background-secondary text-foreground-secondary rounded-lg hover:bg-background-tertiary transition-colors focus-ring"
                aria-label="Cancel sharing"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}