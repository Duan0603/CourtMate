'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface LoadingConfig {
  /** Navigation threshold in ms before showing route transition loader. Default: 250ms */
  navThresholdMs: number;
  /** Initial cinematic preloader minimum display time in ms. Default: 1800ms */
  initialPreloaderMinMs: number;
  /** Initial cinematic preloader maximum timeout in ms before fallback readiness. Default: 7000ms */
  initialPreloaderMaxMs: number;
  /** Async content delay threshold in ms. Default: 200ms */
  asyncThresholdMs: number;
}

export const DEFAULT_LOADING_CONFIG: LoadingConfig = {
  navThresholdMs: 150,
  initialPreloaderMinMs: 200,
  initialPreloaderMaxMs: 2500,
  asyncThresholdMs: 150,
};

interface TransitionState {
  isNavigating: boolean;
  isLoaderVisible: boolean;
  navKey: number;
  destinationPath: string | null;
}

interface LoadingContextValue {
  config: LoadingConfig;
  updateConfig: (newConfig: Partial<LoadingConfig>) => void;
  // Initial Preloader
  isInitialLoading: boolean;
  initialPreloaderFailed: boolean;
  initialPreloaderError: string | null;
  finishInitialPreloader: () => void;
  failInitialPreloader: (errMsg?: string) => void;
  retryInitialPreloader: () => void;
  // Route Transition
  isNavigating: boolean;
  isNavLoaderVisible: boolean;
  startNavigation: (destinationUrl?: string) => void;
  completeNavigation: () => void;
  cancelNavigation: () => void;
  // Helpers
  withSmartThreshold: <T>(
    promise: Promise<T>,
    onShowLoader: (show: boolean) => void,
    thresholdMs?: number
  ) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: Partial<LoadingConfig>;
}) {
  const [config, setConfig] = useState<LoadingConfig>({
    ...DEFAULT_LOADING_CONFIG,
    ...initialConfig,
  });

  const pathname = usePathname();

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Initial Cinematic Preloader State
  // ──────────────────────────────────────────────────────────────────────────
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [initialPreloaderFailed, setInitialPreloaderFailed] = useState<boolean>(false);
  const [initialPreloaderError, setInitialPreloaderError] = useState<string | null>(null);

  const initialMountTimeRef = useRef<number>(Date.now());
  const initialMinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialMaxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appReadinessSatisfiedRef = useRef<boolean>(false);

  // Check if minimum animation has elapsed
  const finishInitialPreloader = useCallback(() => {
    appReadinessSatisfiedRef.current = true;
    const elapsed = Date.now() - initialMountTimeRef.current;
    const remainingMin = Math.max(0, config.initialPreloaderMinMs - elapsed);

    if (remainingMin === 0) {
      setIsInitialLoading(false);
      setInitialPreloaderFailed(false);
    } else {
      if (initialMinTimeoutRef.current) clearTimeout(initialMinTimeoutRef.current);
      initialMinTimeoutRef.current = setTimeout(() => {
        setIsInitialLoading(false);
        setInitialPreloaderFailed(false);
      }, remainingMin);
    }
  }, [config.initialPreloaderMinMs]);

  const failInitialPreloader = useCallback((errMsg?: string) => {
    setInitialPreloaderFailed(true);
    setInitialPreloaderError(errMsg || 'Không thể kết nối hoặc khởi tạo dữ liệu ban đầu. Vui lòng thử lại.');
  }, []);

  const retryInitialPreloader = useCallback(() => {
    setInitialPreloaderFailed(false);
    setInitialPreloaderError(null);
    setIsInitialLoading(true);
    initialMountTimeRef.current = Date.now();
    appReadinessSatisfiedRef.current = false;

    // Trigger soft readiness attempt
    if (initialMinTimeoutRef.current) clearTimeout(initialMinTimeoutRef.current);
    initialMinTimeoutRef.current = setTimeout(() => {
      finishInitialPreloader();
    }, config.initialPreloaderMinMs);
  }, [config.initialPreloaderMinMs, finishInitialPreloader]);

  useEffect(() => {
    // Safety fallback: if app takes longer than initialPreloaderMaxMs and not failed, auto ready
    initialMaxTimeoutRef.current = setTimeout(() => {
      if (isInitialLoading && !initialPreloaderFailed) {
        setIsInitialLoading(false);
      }
    }, config.initialPreloaderMaxMs);

    // Initial finish trigger check
    const minTimer = setTimeout(() => {
      if (appReadinessSatisfiedRef.current) {
        setIsInitialLoading(false);
      }
    }, config.initialPreloaderMinMs);

    return () => {
      if (initialMinTimeoutRef.current) clearTimeout(initialMinTimeoutRef.current);
      if (initialMaxTimeoutRef.current) clearTimeout(initialMaxTimeoutRef.current);
      clearTimeout(minTimer);
    };
  }, [config.initialPreloaderMinMs, config.initialPreloaderMaxMs, isInitialLoading, initialPreloaderFailed]);

  // Mark readiness once mounted client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      finishInitialPreloader();
    }
  }, [finishInitialPreloader]);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Smart Page Transition Navigation Loader
  // ──────────────────────────────────────────────────────────────────────────
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isNavigating: false,
    isLoaderVisible: false,
    navKey: 0,
    destinationPath: null,
  });

  const navTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeNavKeyRef = useRef<number>(0);
  const lastCompletedPathRef = useRef<string>(pathname);

  // Start tracking navigation
  const startNavigation = useCallback((destinationUrl?: string) => {
    if (destinationUrl && (destinationUrl === pathname || destinationUrl.split('?')[0] === pathname)) {
      // Navigating to exact same page, ignore
      return;
    }

    const nextNavKey = ++activeNavKeyRef.current;

    // Clear existing timer
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    // Set navigating immediately, but keep loader hidden until threshold
    setTransitionState({
      isNavigating: true,
      isLoaderVisible: false,
      navKey: nextNavKey,
      destinationPath: destinationUrl || null,
    });

    // Schedule threshold
    navTimerRef.current = setTimeout(() => {
      // Only show loader if this is still the active navigation
      if (activeNavKeyRef.current === nextNavKey) {
        setTransitionState((prev) => {
          if (prev.navKey === nextNavKey && prev.isNavigating) {
            return { ...prev, isLoaderVisible: true };
          }
          return prev;
        });
      }
    }, config.navThresholdMs);
  }, [pathname, config.navThresholdMs]);

  // Complete navigation
  const completeNavigation = useCallback(() => {
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }

    setTransitionState((prev) => ({
      ...prev,
      isNavigating: false,
      isLoaderVisible: false,
      destinationPath: null,
    }));
  }, []);

  // Cancel navigation (e.g. error or back action)
  const cancelNavigation = useCallback(() => {
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    setTransitionState({
      isNavigating: false,
      isLoaderVisible: false,
      navKey: activeNavKeyRef.current,
      destinationPath: null,
    });
  }, []);

  // Auto detect route change via Next.js router
  useEffect(() => {
    if (pathname !== lastCompletedPathRef.current) {
      lastCompletedPathRef.current = pathname;
      completeNavigation();
    }
  }, [pathname, completeNavigation]);

  // Global click interceptor for smart navigation detection
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Check if target is an anchor tag with local href
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Skip external links, hash only, mailto, tel, downloads or new window tabs
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || targetAttr === '_blank') {
        return;
      }

      // Check if modifier keys were pressed (Cmd+click, Ctrl+click, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      startNavigation(href);
    };

    window.addEventListener('click', handleDocumentClick, true);
    return () => {
      window.removeEventListener('click', handleDocumentClick, true);
    };
  }, [startNavigation]);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Asynchronous Content Loading Threshold Helper
  // ──────────────────────────────────────────────────────────────────────────
  const withSmartThreshold = useCallback(
    async <T,>(
      promise: Promise<T>,
      onShowLoader: (show: boolean) => void,
      thresholdMs: number = config.asyncThresholdMs
    ): Promise<T> => {
      let isPending = true;
      let showedLoader = false;

      const timer = setTimeout(() => {
        if (isPending) {
          showedLoader = true;
          onShowLoader(true);
        }
      }, thresholdMs);

      try {
        const result = await promise;
        isPending = false;
        clearTimeout(timer);
        if (showedLoader) {
          onShowLoader(false);
        }
        return result;
      } catch (err) {
        isPending = false;
        clearTimeout(timer);
        if (showedLoader) {
          onShowLoader(false);
        }
        throw err;
      }
    },
    [config.asyncThresholdMs]
  );

  const updateConfig = useCallback((newConfig: Partial<LoadingConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        config,
        updateConfig,
        isInitialLoading,
        initialPreloaderFailed,
        initialPreloaderError,
        finishInitialPreloader,
        failInitialPreloader,
        retryInitialPreloader,
        isNavigating: transitionState.isNavigating,
        isNavLoaderVisible: transitionState.isLoaderVisible,
        startNavigation,
        completeNavigation,
        cancelNavigation,
        withSmartThreshold,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
