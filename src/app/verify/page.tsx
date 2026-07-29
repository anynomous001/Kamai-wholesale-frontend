"use client";
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Verify() {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length > 1) {
      e.target.value = value.slice(0, 1);
    }
    if (e.target.value !== '' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    router.push('/onboarding/step-1');
  };

  return (
    <main className="w-full h-full flex flex-col bg-background relative">
      {/* Transactional Header */}
      <header className="h-14 px-container-margin flex items-center justify-between shrink-0">
        <button aria-label="Go back" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors -ml-2 text-on-background" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <div className="flex-1 px-container-margin pt-xl flex flex-col w-full">
        <h1 className="text-headline-xl text-on-background mb-xs">
          Verify your number
        </h1>
        <div className="flex items-center gap-sm mb-xl">
          <p className="text-body-md text-on-surface-variant">
            Code sent to +1 234 567 8900
          </p>
          <button className="text-label-md text-primary hover:text-primary-container transition-colors">
            Edit
          </button>
        </div>

        {/* OTP Input Grid */}
        <div className="flex justify-between gap-sm mb-xl" id="otp-container">
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              aria-label={`Digit ${index + 1}`}
              className="w-16 h-20 bg-surface-container-lowest border border-outline-variant rounded-lg text-center text-headline-xl text-on-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow hide-number-spinners"
              maxLength={1}
              pattern="\d*"
              type="number"
              onChange={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        {/* Resend Action */}
        <div className="text-center mt-md">
          <p className="text-body-sm text-on-surface-variant">
            Didn&apos;t receive the code? 
            <button className="text-label-sm text-on-background underline decoration-outline hover:text-primary hover:decoration-primary transition-all ml-1">
              Resend in 00:30
            </button>
          </p>
        </div>
      </div>

      {/* Bottom Anchored Primary Action */}
      <div className="px-container-margin pb-6 pt-4 w-full shrink-0">
        <Button variant="primary" className="w-full shadow-md" onClick={handleVerify}>
          Verify
        </Button>
      </div>
    </main>
  );
}
