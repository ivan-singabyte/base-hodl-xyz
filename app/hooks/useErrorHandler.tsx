'use client';

import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  retry?: () => void;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: unknown, retryFn?: () => Promise<void>) => {
    let errorMessage = 'An unexpected error occurred';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      // Parse common blockchain errors
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled';
        errorCode = 'USER_REJECTED';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
        errorCode = 'INSUFFICIENT_FUNDS';
      } else if (error.message.includes('gas')) {
        errorMessage = 'Gas estimation failed. Please try again';
        errorCode = 'GAS_ERROR';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection';
        errorCode = 'NETWORK_ERROR';
      } else if (error.message.includes('nonce')) {
        errorMessage = 'Transaction nonce error. Please reset your wallet';
        errorCode = 'NONCE_ERROR';
      } else {
        errorMessage = error.message;
      }
    }

    setError({
      message: errorMessage,
      code: errorCode,
      retry: retryFn ? async () => {
        setIsRetrying(true);
        try {
          await retryFn();
          setError(null);
        } catch (retryError) {
          handleError(retryError, retryFn);
        } finally {
          setIsRetrying(false);
        }
      } : undefined
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    clearError
  };
}

// Error display component
export function ErrorDisplay({ 
  error, 
  onDismiss,
  onRetry 
}: { 
  error: ErrorState | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}) {
  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-slide-in">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
            {error.code && (
              <p className="mt-1 text-xs text-red-600">Code: {error.code}</p>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-3 flex-shrink-0 text-red-600 hover:text-red-800"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        {(error.retry || onRetry) && (
          <div className="mt-3">
            <button
              onClick={error.retry || onRetry}
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}