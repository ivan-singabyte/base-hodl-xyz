'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function UserProfile() {
  const { farcasterUser, address, isConnected, disconnect } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use Farcaster user if available
  const displayUser = farcasterUser;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  if (!displayUser && !isConnected) {
    return null;
  }
  
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // Show temporary success message
      const prevText = document.querySelector('.copy-feedback')?.textContent;
      const feedbackEl = document.querySelector('.copy-feedback');
      if (feedbackEl) {
        feedbackEl.textContent = 'Copied!';
        setTimeout(() => {
          feedbackEl.textContent = prevText || 'Copy address';
        }, 2000);
      }
    }
    setIsDropdownOpen(false);
  };
  
  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-background-secondary rounded-lg hover:bg-background-secondary/80 transition-colors cursor-pointer"
      >
        {/* Avatar */}
        {displayUser?.pfpUrl && typeof displayUser.pfpUrl === 'string' && displayUser.pfpUrl.length > 0 ? (
          <img
            src={displayUser.pfpUrl}
            alt={displayUser.displayName || displayUser.username || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-base-blue to-base-blue-dark flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {(typeof displayUser?.username === 'string' && displayUser.username.length > 0) 
                ? displayUser.username.charAt(0).toUpperCase() 
                : address 
                  ? address.slice(2, 4).toUpperCase() 
                  : '0x'}
            </span>
          </div>
        )}
        
        {/* User info */}
        <div className="flex flex-col text-left">
          {displayUser ? (
            <>
              <span className="text-sm font-medium text-foreground">
                {displayUser.displayName || displayUser.username}
              </span>
              {/* Always show address if connected, even in Mini App mode */}
              {address && (
                <span className="text-xs text-foreground-secondary font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-foreground-secondary font-mono">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </span>
          )}
        </div>
        
        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-foreground-secondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background-secondary backdrop-blur-md rounded-lg shadow-xl border border-border z-50 animate-fade-in">
          <div className="py-2">
            {address && (
              <>
                <button
                  onClick={handleCopyAddress}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-base-blue/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="copy-feedback">Copy address</span>
                </button>
                <div className="border-t border-border/50 my-1" />
              </>
            )}
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}