"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { getProfile } from '@/lib/api/profile';
import type { WholesalerProfile } from '@/lib/api/types';

// Persistent chrome shared by the tab-level pages only (mirrors baker-side's
// single navbar wrapping its Home/Calendar/Settings tabs) — drill-down pages
// like /orders/[id] keep their own contextual back/close header instead.
const TAB_ROUTES = ['/dashboard', '/catalogue', '/orders', '/settings'];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<WholesalerProfile | null>(null);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  if (!TAB_ROUTES.includes(pathname)) return null;

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 border-b border-border bg-background sticky top-0 z-30">
      <div className="flex items-center select-none">
        <Image
          src={theme === 'dark' ? '/dark-bg-logo.png' : '/light-bg-logo.png'}
          alt="Kamai Wholesale"
          width={200}
          height={80}
          className="h-9 w-auto object-contain"
          priority
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:bg-surface transition-all cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-500" />}
        </button>

        <button className="relative p-1.5 rounded-full hover:bg-surface transition-all cursor-pointer" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
        </button>

        <div
          onClick={() => router.push('/settings')}
          className="w-10 h-10 rounded-full overflow-hidden border border-border flex items-center justify-center bg-surface text-sm font-bold text-text-secondary cursor-pointer"
        >
          {profile?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logoUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            (profile?.businessName || '?').charAt(0)
          )}
        </div>
      </div>
    </div>
  );
}
