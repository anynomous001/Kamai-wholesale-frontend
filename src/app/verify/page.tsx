"use client";
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendOtp, verifyOtp } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

  useEffect(() => {
    if (!email) {
      router.replace('/');
      return;
    }
    inputRefs.current[0]?.focus();
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value.replace(/\D/g, '');
    const value = raw.slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value !== '' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && digits[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    setError(null);
    setIsVerifying(true);
    try {
      const { wholesaler } = await verifyOtp(email, otp);
      router.push(wholesaler.status === 'PENDING_ONBOARDING' ? '/onboarding/step-1' : '/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'OTP_EXPIRED':
            setError('This code has expired. Request a new one.');
            break;
          case 'OTP_MAX_ATTEMPTS':
            setError('Too many incorrect attempts. Request a new code.');
            break;
          case 'OTP_INVALID':
            setError('That code is incorrect. Please try again.');
            break;
          default:
            setError(err.message);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setError(null);
    setIsResending(true);
    try {
      await sendOtp(email);
      setCooldown(RESEND_COOLDOWN_SEC);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend code. Try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="w-full h-full flex flex-col bg-background relative">
      {/* Transactional Header */}
      <header className="h-14 px-container-margin flex items-center justify-between shrink-0">
        <button aria-label="Go back" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface transition-colors -ml-2 text-text-primary" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <div className="flex-1 px-container-margin pt-xl flex flex-col w-full">
        <h1 className="text-headline-xl text-text-primary mb-xs">
          Verify your email
        </h1>
        <div className="flex items-center gap-sm mb-xl">
          <p className="text-body-md text-text-secondary">
            Code sent to {email}
          </p>
          <button className="text-label-md text-accent hover:text-accent-hover transition-colors" onClick={() => router.replace('/')}>
            Edit
          </button>
        </div>

        {/* OTP Input Grid */}
        <div className="flex justify-between gap-sm mb-xl" id="otp-container">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              aria-label={`Digit ${index + 1}`}
              className="w-12 h-16 bg-surface border border-border rounded-lg text-center text-headline-xl text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-shadow hide-number-spinners"
              maxLength={1}
              pattern="\d*"
              type="number"
              value={digits[index]}
              onChange={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={isVerifying}
            />
          ))}
        </div>

        {error && <p className="text-body-sm text-error-text mb-md">{error}</p>}

        {/* Resend Action */}
        <div className="text-center mt-md">
          <p className="text-body-sm text-text-secondary">
            Didn&apos;t receive the code?{' '}
            <button
              className="text-label-sm text-text-primary underline decoration-text-secondary hover:text-accent hover:decoration-accent transition-all ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
            >
              {cooldown > 0 ? `Resend in 00:${String(cooldown).padStart(2, '0')}` : isResending ? 'Sending…' : 'Resend code'}
            </button>
          </p>
        </div>
      </div>

      {/* Bottom Anchored Primary Action */}
      <div className="px-container-margin pb-6 pt-4 w-full shrink-0">
        <Button variant="primary" className="w-full shadow-md" onClick={handleVerify} disabled={isVerifying}>
          {isVerifying ? 'Verifying…' : 'Verify'}
        </Button>
      </div>
    </main>
  );
}

export default function Verify() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
