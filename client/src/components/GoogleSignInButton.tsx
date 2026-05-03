import { useEffect, useRef } from 'react';

type Flow = 'signin' | 'signup';

/** Avoids GIS warning: google.accounts.id.initialize() is called multiple times */
let gsiInitializedForClientId: string | null = null;

const latestOnSuccess: {
  current: ((credential: string) => Promise<void> | void) | null;
} = { current: null };

interface GoogleSignInButtonProps {
  flow: Flow;
  disabled?: boolean;
  onSuccess: (credential: string) => Promise<void>;
}

/**
 * Renders the official Google Identity Services button when VITE_GOOGLE_CLIENT_ID is set.
 */
export function GoogleSignInButton({ flow, disabled, onSuccess }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  // Keep GIS callback on the latest handler without re-calling initialize().
  latestOnSuccess.current = onSuccess;

  useEffect(() => {
    if (!clientId || !containerRef.current) {
      return;
    }

    const el = containerRef.current;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const mountButton = () => {
      if (cancelled || !window.google?.accounts?.id) {
        return;
      }

      if (gsiInitializedForClientId !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) {
              return;
            }
            await latestOnSuccess.current?.(response.credential);
          },
        });
        gsiInitializedForClientId = clientId;
      }

      el.innerHTML = '';

      window.google.accounts.id.renderButton(el, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: flow === 'signup' ? 'signup_with' : 'signin_with',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      mountButton();
    } else {
      intervalId = window.setInterval(() => {
        if (window.google?.accounts?.id) {
          if (intervalId) window.clearInterval(intervalId);
          mountButton();
        }
      }, 50);
    }

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      el.innerHTML = '';
    };
  }, [clientId, flow]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-gray-400">
        Google sign-in is unavailable (missing VITE_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex min-h-[44px] w-full justify-center [&>div]:!w-full ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      aria-hidden={disabled}
    />
  );
}
