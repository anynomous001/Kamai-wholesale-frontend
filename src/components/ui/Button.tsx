import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    
    let variantClasses = '';
    
    switch (variant) {
      case 'primary':
        variantClasses = 'bg-accent text-white shadow-sm hover:bg-accent-hover active:scale-[0.98]';
        break;
      case 'secondary':
        variantClasses = 'bg-background text-text-primary border border-border shadow-sm hover:bg-surface active:scale-[0.98]';
        break;
      case 'outline':
        variantClasses = 'bg-transparent border border-border text-accent hover:bg-accent/5 active:scale-[0.98]';
        break;
      case 'text':
        variantClasses = 'bg-transparent text-accent hover:bg-accent/5 active:scale-[0.98]';
        break;
    }

    return (
      <button
        ref={ref}
        className={`h-14 font-label-md text-label-md rounded flex items-center justify-center px-4 transition-all duration-200 ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
