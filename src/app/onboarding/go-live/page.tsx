"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOnboardingStatus, goLive } from '@/lib/api/onboarding';
import { ApiError } from '@/lib/api/client';
import type { OnboardingCheck, OnboardingStatus } from '@/lib/api/types';

const CHECKS: { key: OnboardingCheck; title: string; description: string; editHref: string }[] = [
  { key: 'profileComplete', title: 'Profile', description: 'Your business details, location, and hours are set.', editHref: '/onboarding/step-1' },
  { key: 'catalogueReady', title: 'Catalogue', description: 'Add at least 1 product to your wholesale offering.', editHref: '/onboarding/step-2' },
  { key: 'fulfilmentRulesSet', title: 'Fulfilment', description: 'Delivery zones or pickup location are configured.', editHref: '/onboarding/step-3' },
  { key: 'paymentPolicySet', title: 'Payment', description: 'Your advance payment policy has been saved.', editHref: '/onboarding/step-4' },
];

export default function GoLive() {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      setStatus(await getOnboardingStatus());
    } catch {
      setError('Could not load your onboarding status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setStatus(await getOnboardingStatus());
      } catch {
        setError('Could not load your onboarding status.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleGoLive = async () => {
    setError(null);
    setIsGoingLive(true);
    try {
      await goLive();
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ONBOARDING_INCOMPLETE') {
        const failedChecks = (err.details as { failedChecks?: OnboardingCheck[] } | undefined)?.failedChecks ?? [];
        setError(`Not quite ready yet: ${failedChecks.map((c) => CHECKS.find((chk) => chk.key === c)?.title ?? c).join(', ')} still need attention.`);
        await loadStatus();
        const firstFailed = CHECKS.find((c) => failedChecks.includes(c.key));
        if (firstFailed) router.push(firstFailed.editHref);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsGoingLive(false);
    }
  };

  return (
    <main className="w-full h-full flex flex-col bg-background relative pb-24 overflow-y-auto kamai-scrollbar">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-border shrink-0">
        <button className="text-text-secondary hover:bg-background p-2 rounded-full transition-colors flex items-center justify-center -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-accent text-center flex-1">Go-Live</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Canvas */}
      <div className="pt-6 px-container-margin flex flex-col">
        {/* Hero Header */}
        <div className="mb-8 text-left">
          <h2 className="font-headline-xl text-headline-xl text-text-primary mb-sm">You&apos;re almost live.</h2>
          <p className="font-body-lg text-body-lg text-text-secondary">Complete these final steps to launch your wholesale portal and start accepting orders.</p>
        </div>

        {error && (
          <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3 mb-6">
            <p className="text-body-sm text-error-text">{error}</p>
          </div>
        )}

        {isLoading || !status ? (
          <p className="text-body-md text-text-secondary">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-md">
            {CHECKS.map(({ key, title, description, editHref }) => {
              const done = status[key];
              return (
                <div key={key} className={`bg-surface rounded-lg p-lg border border-border flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${done ? '' : 'ring-1 ring-accent/20'}`}>
                  <div className="flex items-start justify-between mb-md">
                    <div className="flex items-center gap-sm">
                      <span className={`material-symbols-outlined text-[28px] ${done ? 'text-accent' : 'text-text-secondary'}`} style={done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                        {done ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">{title}</h3>
                    </div>
                    <button className="font-label-md text-label-md text-accent hover:underline" onClick={() => router.push(editHref)}>Edit</button>
                  </div>
                  <p className="font-body-md text-body-md text-text-secondary mb-md flex-1">{description}</p>
                  <div className="w-full bg-background rounded-full h-1.5 mt-auto">
                    <div className={`bg-accent h-1.5 rounded-full ${done ? 'w-full' : 'w-0'}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Area */}
      <div className="absolute bottom-0 left-0 w-full bg-surface-glass backdrop-blur-md border-t border-border p-container-margin z-40 pb-safe shrink-0">
        <button
          onClick={handleGoLive}
          disabled={isLoading || isGoingLive || !status?.allComplete}
          className="w-full h-14 bg-accent text-white font-label-md text-label-md rounded flex items-center justify-center gap-sm shadow-[0px_4px_20px_rgba(45,27,20,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">rocket_launch</span>
          {isGoingLive ? 'Going live…' : 'Go Live'}
        </button>
      </div>
    </main>
  );
}
