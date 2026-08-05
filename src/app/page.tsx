"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { sendOtp } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useTheme } from '@/lib/theme';

export default function Login() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await sendOtp(email);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        // RATE_LIMITED messages already carry the exact cooldown/remaining count from the server.
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full h-full flex flex-col justify-between relative overflow-hidden bg-background">

      {/* Top Section: Logo and Pitch */}
      <div className="flex-1 flex flex-col items-center justify-center px-container-margin text-center relative z-10">
        <div className="mb-6 flex items-center justify-center">
          <Image
            src={theme === 'dark' ? '/dark-bg-logo.png' : '/light-bg-logo.png'}
            alt="Kamai Wholesale"
            width={200}
            height={80}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-headline-xl text-text-primary mb-2">Kamai Wholesale</h1>
        <p className="text-body-lg text-text-secondary max-w-[280px]">
          Digitise your catalogue, get bakery orders.
        </p>
      </div>

      {/* Bottom Section: Input and Action */}
      <div className="w-full px-container-margin pb-8 relative z-10 bg-background">
        <form className="w-full flex flex-col gap-lg" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-text-primary" htmlFor="email">Email Address</label>
            <div className="relative flex items-center bg-surface border border-border rounded-lg overflow-hidden shadow-sm h-14 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
              <input
                className="flex-1 h-full px-4 py-2 bg-surface text-text-primary text-body-md placeholder:text-text-secondary border-none focus:outline-none focus:ring-0"
                id="email"
                name="email"
                placeholder="you@business.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-body-sm text-error-text">{error}</p>}
          </div>

          <Button type="submit" variant="primary" className="w-full shadow-level-2" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send OTP'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-body-sm text-text-secondary">
            By continuing, you agree to our{' '}
            <a className="text-accent hover:underline text-label-sm" href="#">Terms of Service</a>{' '}
            and{' '}
            <a className="text-accent hover:underline text-label-sm" href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Decorative Ambient Blur (Subtle) */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent opacity-[0.04] rounded-full blur-3xl pointer-events-none"></div>
    </main>
  );
}
