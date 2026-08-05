"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { getProfile } from '@/lib/api/profile';
import { updateNotificationPreferences } from '@/lib/api/notifications';
import { logout } from '@/lib/api/auth';
import type { WholesalerProfile } from '@/lib/api/types';

const NOTIFICATION_PREF_STORAGE_KEY = 'kamai.notificationPreferences';

export default function Settings() {
  const router = useRouter();
  const [profile, setProfile] = useState<WholesalerProfile | null>(null);
  // No GET for notification preferences exists — track the last-written value ourselves, default true.
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem(NOTIFICATION_PREF_STORAGE_KEY);
    return stored !== null ? stored === 'true' : true;
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const handleToggleNotifications = async () => {
    const next = !notificationsEnabled;
    setIsSavingNotifications(true);
    try {
      const result = await updateNotificationPreferences(next);
      setNotificationsEnabled(result.newOrderEmailEnabled);
      window.localStorage.setItem(NOTIFICATION_PREF_STORAGE_KEY, String(result.newOrderEmailEnabled));
    } catch {
      // leave the toggle as-is; user can retry
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      window.localStorage.removeItem(NOTIFICATION_PREF_STORAGE_KEY);
      router.push('/');
    }
  };

  return (
    <main className="w-full flex-1 min-h-0 bg-background text-text-primary font-body-md flex flex-col antialiased selection:bg-accent/30 relative overflow-hidden">
      {/* Main Content Canvas */}
      <div className="flex-1 w-full max-w-[1024px] mx-auto pb-32 px-container-margin pt-lg flex flex-col gap-xl overflow-y-auto kamai-scrollbar">
        <h1 className="font-headline-xl text-headline-xl text-text-primary tracking-tight">Settings</h1>

        {/* Account Summary */}
        <section className="flex flex-col gap-4">
          <div className="bg-surface p-md rounded-lg border border-border shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-md">
              <div className="w-[60px] h-[60px] rounded-full bg-background border border-border overflow-hidden shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-text-secondary text-3xl">storefront</span>
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">{profile?.businessName || 'Your Business'}</h2>
                <p className="font-body-sm text-body-sm text-text-secondary">{profile?.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Preferences */}
        <section className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-text-secondary uppercase tracking-wider px-2">App Preferences</h3>
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden flex flex-col">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-text-secondary">notifications</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-text-primary font-medium">New Order Emails</span>
                  <span className="font-body-sm text-body-sm text-text-secondary">Email me when I receive a new order</span>
                </div>
              </div>
              {/* Toggle Switch */}
              <button
                aria-checked={notificationsEnabled}
                disabled={isSavingNotifications}
                className={`w-12 h-[26px] rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 shadow-inner border cursor-pointer group disabled:opacity-60 ${notificationsEnabled ? 'bg-accent border-accent' : 'bg-background border-border'}`}
                onClick={handleToggleNotifications}
                role="switch"
              >
                <div className={`w-5 h-5 rounded-full absolute left-[3px] top-[2px] transition-transform duration-300 shadow-[0_1px_3px_rgba(45,27,20,0.2)] ${notificationsEnabled ? 'translate-x-[22px] bg-white' : 'bg-text-primary/20'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Business Setup */}
        <section className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-text-secondary uppercase tracking-wider px-2">Business Setup</h3>
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden flex flex-col">
            <button onClick={() => router.push('/settings/business-profile')} className="w-full flex items-center justify-between p-md border-b border-border hover:bg-background transition-colors text-left active:bg-background focus:outline-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-text-secondary">storefront</span>
                </div>
                <span className="font-body-md text-body-md text-text-primary font-medium">Business Profile</span>
              </div>
              <span className="material-symbols-outlined text-text-secondary text-[20px]">chevron_right</span>
            </button>
            <button onClick={() => router.push('/settings/fulfilment')} className="w-full flex items-center justify-between p-md border-b border-border hover:bg-background transition-colors text-left active:bg-background focus:outline-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-text-secondary">local_shipping</span>
                </div>
                <span className="font-body-md text-body-md text-text-primary font-medium">Fulfilment Settings</span>
              </div>
              <span className="material-symbols-outlined text-text-secondary text-[20px]">chevron_right</span>
            </button>
            <button onClick={() => router.push('/settings/payment')} className="w-full flex items-center justify-between p-md hover:bg-background transition-colors text-left active:bg-background focus:outline-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-text-secondary">credit_card</span>
                </div>
                <span className="font-body-md text-body-md text-text-primary font-medium">Payment Policy</span>
              </div>
              <span className="material-symbols-outlined text-text-secondary text-[20px]">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 p-md bg-surface text-error-text font-label-md text-label-md rounded-lg border border-error-border hover:bg-error-bg active:bg-error-bg transition-colors mt-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-error-text focus:ring-offset-2 disabled:opacity-60"
        >
          <span className="material-symbols-outlined">logout</span>
          {isLoggingOut ? 'Logging out…' : 'Log Out'}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
