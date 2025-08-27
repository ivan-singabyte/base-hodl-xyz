'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'current';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'text-base-blue',
    white: 'text-white',
    current: 'text-current',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {text && (
        <p className={`text-sm font-medium ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="card p-8 animate-scale-in">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

export function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s]">.</span>
      <span className="animate-bounce">.</span>
    </span>
  );
}

export function LoadingBar({ progress }: { progress?: number }) {
  return (
    <div className="w-full bg-background-secondary rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-base-blue to-base-blue-light transition-all duration-300 ease-out"
        style={{ width: progress ? `${progress}%` : '0%' }}
      >
        {!progress && (
          <div className="h-full w-full bg-gradient-to-r from-base-blue to-base-blue-light animate-pulse" />
        )}
      </div>
    </div>
  );
}