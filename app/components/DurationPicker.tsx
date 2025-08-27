'use client';

import { addDays, addMonths, addYears, format } from 'date-fns';

interface DurationOption {
  label: string;
  days?: number;
  months?: number;
  seconds: bigint;
}

const DURATION_OPTIONS: DurationOption[] = [
  { label: '1 Day', days: 1, seconds: BigInt(86400) },
  { label: '1 Month', months: 1, seconds: BigInt(2592000) },
  { label: '6 Months', months: 6, seconds: BigInt(15552000) },
  { label: '1 Year', months: 12, seconds: BigInt(31536000) },
  { label: '3 Years', months: 36, seconds: BigInt(94608000) },
  { label: '10 Years', months: 120, seconds: BigInt(315360000) },
];

interface DurationPickerProps {
  onDurationSelect: (duration: bigint) => void;
  selectedDuration: bigint | null;
}

export default function DurationPicker({ onDurationSelect, selectedDuration }: DurationPickerProps) {
  const getUnlockDate = (option: DurationOption) => {
    const now = new Date();
    if (option.days) {
      return addDays(now, option.days);
    }
    if (option.months === 120) {
      return addYears(now, 10);
    }
    return addMonths(now, option.months || 0);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground-secondary">
        Select Lock Duration
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DURATION_OPTIONS.map((option) => {
          const isSelected = selectedDuration === option.seconds;
          const unlockDate = getUnlockDate(option);
          
          return (
            <button
              key={option.label}
              onClick={() => onDurationSelect(option.seconds)}
              className={`
                touch-target p-4 rounded-lg border-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus-ring
                ${isSelected 
                  ? 'border-base-blue bg-base-blue/20 shadow-md shadow-base-blue/20' 
                  : 'border-border hover:border-border-strong hover:bg-background-secondary'
                }
              `}
              aria-label={`Lock for ${option.label} until ${format(unlockDate, 'MMMM d, yyyy')}`}
              aria-pressed={isSelected}
            >
              <div className={`font-semibold ${isSelected ? 'text-base-blue' : 'text-foreground'}`}>
                {option.label}
              </div>
              <div className={`text-xs mt-1 ${isSelected ? 'text-base-blue/80' : 'text-foreground-tertiary'}`}>
                Until {format(unlockDate, option.days ? 'MMM d, yyyy' : 'MMM yyyy')}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDuration && (
        <div className="bg-warning-light border border-warning/20 p-3 rounded-lg animate-slide-down">
          <p className="text-sm text-warning flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>No early withdrawal allowed. Tokens will be locked until the selected date.</span>
          </p>
        </div>
      )}
    </div>
  );
}