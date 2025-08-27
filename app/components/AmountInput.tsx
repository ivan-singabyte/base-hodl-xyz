'use client';

import { useState } from 'react';
import { parseUnits } from 'viem';
import { Token } from '@coinbase/onchainkit/token';
import { formatTokenBalance } from '@/app/utils/formatBalance';

interface AmountInputProps {
  onAmountChange: (amount: string, amountWei: bigint) => void;
  maxAmount: string;
  selectedToken: Token | null;
}

export default function AmountInput({ onAmountChange, maxAmount, selectedToken }: AmountInputProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const percentageButtons = [
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: 'MAX', value: 1 },
  ];

  const handleAmountChange = (value: string) => {
    // Allow decimal input
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError('');

      if (value && selectedToken) {
        try {
          // Parse the entered amount
          const amountWei = parseUnits(value, selectedToken.decimals);
          
          // Only validate against balance if we have a valid maxAmount
          if (maxAmount && maxAmount !== '0') {
            const maxWei = parseUnits(maxAmount, selectedToken.decimals);
            
            if (amountWei > maxWei) {
              setError('Amount exceeds balance');
              onAmountChange('', BigInt(0)); // Reset the amount
              return;
            }
          }
          
          if (amountWei === BigInt(0)) {
            setError('Amount must be greater than 0');
            onAmountChange('', BigInt(0));
          } else {
            // Valid amount
            setError('');
            onAmountChange(value, amountWei);
          }
        } catch (err) {
          console.error('Error parsing amount:', err);
          setError('Invalid amount');
          onAmountChange('', BigInt(0));
        }
      } else {
        onAmountChange('', BigInt(0));
      }
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (!selectedToken) return;
    
    const maxFloat = parseFloat(maxAmount);
    const percentAmount = (maxFloat * percentage).toFixed(selectedToken.decimals);
    handleAmountChange(percentAmount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label htmlFor="amount-input" className="text-sm font-medium text-foreground-secondary">
          Amount to Lock
        </label>
        {selectedToken && maxAmount && maxAmount !== '0' && (
          <span className="text-sm text-foreground-tertiary">
            Balance: {formatTokenBalance(maxAmount)} {selectedToken.symbol}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <input
            id="amount-input"
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.0"
            disabled={!selectedToken}
            aria-label="Amount to lock"
            aria-invalid={!!error}
            aria-describedby={error ? "amount-error" : undefined}
            className={`
              w-full touch-target px-4 py-3 pr-20 text-lg rounded-lg border transition-colors
              bg-background-secondary text-foreground placeholder-foreground-tertiary
              ${error 
                ? 'border-error focus:border-error' 
                : 'border-border focus:border-base-blue'
              }
              focus:outline-none focus:ring-2 focus:ring-base-blue/20 
              disabled:bg-background-tertiary disabled:cursor-not-allowed disabled:text-foreground-tertiary
              selection:bg-base-blue selection:text-white
            `}
          />
          {selectedToken && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-tertiary font-medium">
              {selectedToken.symbol}
            </div>
          )}
        </div>

        {error && (
          <p id="amount-error" className="text-sm text-error animate-slide-down" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          {percentageButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={() => handlePercentageClick(btn.value)}
              disabled={!selectedToken || !maxAmount || maxAmount === '0'}
              className="flex-1 touch-target py-2 px-3 text-sm font-medium rounded-lg
                         border border-border hover:bg-background-secondary active:bg-background-tertiary
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all transform hover:scale-[1.02] active:scale-[0.98] focus-ring"
              aria-label={`Set amount to ${btn.label === 'MAX' ? 'maximum' : btn.label}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}