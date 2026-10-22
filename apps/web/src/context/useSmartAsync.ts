'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLoading } from './LoadingContext';

interface UseSmartAsyncOptions {
  /** Threshold in ms to wait before marking loader as visible. Defaults to global config (200ms) */
  thresholdMs?: number;
  /** Whether loading state should start immediately */
  initialLoading?: boolean;
}

export function useSmartAsync(options: UseSmartAsyncOptions = {}) {
  const { config } = useLoading();
  const threshold = options.thresholdMs ?? config.asyncThresholdMs;

  const [loading, setLoading] = useState<boolean>(options.initialLoading ?? false);
  const [isThresholdElapsed, setIsThresholdElapsed] = useState<boolean>(false);
  const [error, setError] = useState<Error | string | null>(null);

  const executionRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setIsThresholdElapsed(false);
    setError(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setIsThresholdElapsed(true);
    }, threshold);
  }, [threshold]);

  const stopLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLoading(false);
    setIsThresholdElapsed(false);
  }, []);

  const failLoading = useCallback((err: Error | string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLoading(false);
    setIsThresholdElapsed(false);
    setError(err);
  }, []);

  /**
   * Run an async task through smart threshold protection
   */
  const execute = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      const execution = ++executionRef.current;
      startLoading();
      try {
        const result = await asyncFn();
        if (execution === executionRef.current) stopLoading();
        return result;
      } catch (err: any) {
        if (execution === executionRef.current) failLoading(err);
        throw err;
      }
    },
    [startLoading, stopLoading, failLoading]
  );

  useEffect(() => {
    return () => {
      executionRef.current++;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    loading,
    isThresholdElapsed,
    error,
    startLoading,
    stopLoading,
    failLoading,
    execute,
    resetError: () => setError(null),
  };
}
