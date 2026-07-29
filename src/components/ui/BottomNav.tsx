"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Catalogue',
      href: '/catalogue',
      icon: 'menu_book',
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: 'receipt_long',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: 'settings',
    }
  ];

  return (
    <nav className="absolute bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-20 bg-surface border-t border-outline-variant/30 shadow-sm">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link 
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all duration-150 active:scale-95 ${isActive ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary' : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-highest'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
