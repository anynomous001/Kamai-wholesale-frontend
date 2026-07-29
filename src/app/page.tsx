"use client";
import React from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/verify');
  };

  return (
    <main className="w-full h-full flex flex-col justify-between relative overflow-hidden bg-background">
      
      {/* Top Section: Logo and Pitch */}
      <div className="flex-1 flex flex-col items-center justify-center px-container-margin text-center relative z-10">
        <div className="w-24 h-24 mb-6 rounded-full bg-surface-container-high flex items-center justify-center shadow-sm border border-outline-variant/30 overflow-hidden">
          <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            bakery_dining
          </span>
        </div>
        <h1 className="text-headline-xl text-on-background mb-2">Kamai Wholesale</h1>
        <p className="text-body-lg text-on-surface-variant max-w-[280px]">
          Digitise your catalogue, get bakery orders.
        </p>
      </div>

      {/* Bottom Section: Input and Action */}
      <div className="w-full px-container-margin pb-8 relative z-10 bg-background">
        <form action="#" className="w-full flex flex-col gap-lg" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface" htmlFor="mobile_number">Mobile Number</label>
            <div className="relative flex items-center bg-surface border border-outline/30 rounded-lg overflow-hidden shadow-sm h-14 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <div className="px-4 py-2 border-r border-outline-variant/30 flex items-center bg-surface-container-lowest text-on-surface-variant h-full">
                <span className="text-body-md">+44</span>
              </div>
              <input 
                className="flex-1 h-full px-4 py-2 bg-surface text-on-background text-body-md placeholder:text-outline border-none focus:outline-none focus:ring-0" 
                id="mobile_number" 
                name="mobile_number" 
                placeholder="7700 900077" 
                required 
                type="tel" 
              />
            </div>
          </div>
          
          <Button type="submit" variant="primary" className="w-full shadow-level-2">
            Send OTP
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-body-sm text-on-surface-variant">
            By continuing, you agree to our{' '}
            <a className="text-primary hover:underline text-label-sm" href="#">Terms of Service</a>{' '}
            and{' '}
            <a className="text-primary hover:underline text-label-sm" href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Decorative Ambient Blur (Subtle) */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-container opacity-[0.04] rounded-full blur-3xl pointer-events-none"></div>
    </main>
  );
}
