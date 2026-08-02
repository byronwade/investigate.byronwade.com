'use client';

import type * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useId, useState } from 'react';

import { cn } from '#/lib/utils';

export type ConsoleToastTone = 'ok' | 'warn' | 'danger' | 'neutral';

type ToastMessage = {
  id: string;
  text: string;
  tone: ConsoleToastTone;
};

type ConsoleToastApi = {
  push: (text: string, tone?: ConsoleToastTone) => void;
};

const ConsoleToastContext = createContext<ConsoleToastApi | null>(null);

const noopToast: ConsoleToastApi = {
  push: () => {
    /* Pages may render outside the shell in tests */
  },
};

export function useConsoleToast(): ConsoleToastApi {
  return useContext(ConsoleToastContext) ?? noopToast;
}

export function ConsoleToastProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const regionId = useId();

  const push = useCallback((text: string, tone: ConsoleToastTone = 'neutral') => {
    setToast({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      tone,
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ConsoleToastContext.Provider value={{ push }}>
      {children}
      <div
        id={regionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--console-tabbar-height)+env(safe-area-inset-bottom,0px)+0.75rem)] z-50 flex justify-center px-4 lg:bottom-6"
      >
        {toast ? (
          <p
            key={toast.id}
            className={cn(
              'console-toast max-w-[min(100%,22rem)] rounded-[10px] px-4 py-3 text-center text-[13px] font-medium shadow-[var(--shadow-md,0_8px_24px_rgb(0_0_0/0.12))]',
              toast.tone === 'ok' && 'console-toast-ok',
              toast.tone === 'warn' && 'console-toast-warn',
              toast.tone === 'danger' && 'console-toast-danger',
              toast.tone === 'neutral' && 'console-toast-neutral',
            )}
          >
            {toast.text}
          </p>
        ) : null}
      </div>
    </ConsoleToastContext.Provider>
  );
}
