"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/lib/api/profile';
import { Navbar } from '@/components/ui/Navbar';

// Guards /dashboard, /catalogue, /orders, /settings: a wholesaler who hasn't
// finished onboarding has no profile/catalogue/fulfilment/payment data for
// these screens to show, so send them back to the start of setup instead.
// Not resumable to the last-completed step — that's a nice-to-have, not
// required for Phase 1.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profile = await getProfile();
        if (cancelled) return;

        if (profile.status !== 'ACTIVE') {
          router.replace('/onboarding/step-1');
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
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
