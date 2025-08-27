'use client';

import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: unknown) => {
    if (error instanceof Error) {
      // Don't retry user rejections
      if (error.message.includes('user rejected')) {
        return false;
      }
      // Retry network and temporary errors
      if (error.message.includes('network') || 
          error.message.includes('timeout') ||
          error.message.includes('rate limit')) {
        return true;
      }
    }
    return true;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const opts = { ...defaultOptions, ...options };

  const executeWithRetry = useCallback(async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    let lastError: unknown;
    let currentDelay = opts.initialDelay;
    
    // Create new abort controller for this execution
    abortControllerRef.current = new AbortController();
    
    for (let i = 0; i <= opts.maxRetries; i++) {
      try {
        setAttempt(i);
        setIsRetrying(i > 0);
        
        // Check if aborted
        if (abortControllerRef.current.signal.aborted) {
          throw new Error('Operation cancelled');
        }
        
        const result = await fn(...args);
        setIsRetrying(false);
        setAttempt(0);
        return result;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (i < opts.maxRetries && opts.shouldRetry(error, i + 1)) {
          // Wait before retrying with exponential backoff
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(resolve, currentDelay);
            
            // Allow cancellation during delay
            abortControllerRef.current?.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Operation cancelled'));
            });
          });
          
          // Increase delay for next retry
          currentDelay = Math.min(currentDelay * opts.backoffFactor, opts.maxDelay);
        } else {
          // No more retries or shouldn't retry
          break;
        }
      }
    }
    
    setIsRetrying(false);
    setAttempt(0);
    throw lastError;
  }, [fn, opts]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsRetrying(false);
    setAttempt(0);
  }, []);

  return {
    execute: executeWithRetry,
    isRetrying,
    attempt,
    cancel
  };
}

// Retry status component
export function RetryStatus({ 
  isRetrying, 
  attempt,
  onCancel
}: { 
  isRetrying: boolean;
  attempt: number;
  onCancel?: () => void;
}) {
  if (!isRetrying) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center">
          <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full mr-3"></div>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Retrying... (Attempt {attempt + 1})
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Please wait while we retry the operation
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="ml-4 text-sm text-yellow-600 hover:text-yellow-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}