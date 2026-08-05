"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/api/profile';

// Guards every /onboarding/* screen (W3-W9): once a wholesaler is ACTIVE,
// setup is done — a stale bookmark or back-button into these screens should
// land on the Dashboard, not let them re-enter the setup flow.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;

        if (profile.status === 'ACTIVE') {
          router.replace('/dashboard');
          return;
        }

        setReady(true);
      } catch {
        // apiFetch already redirects to "/" on an unrecoverable auth failure.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
