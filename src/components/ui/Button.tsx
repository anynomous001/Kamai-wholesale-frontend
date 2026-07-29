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
        variantClasses = 'bg-primary text-on-primary shadow-sm hover:bg-surface-tint active:scale-[0.98]';
        break;
      case 'secondary':
        variantClasses = 'bg-secondary text-on-secondary shadow-sm hover:opacity-90 active:scale-[0.98]';
        break;
      case 'outline':
        variantClasses = 'bg-transparent border border-outline text-primary hover:bg-primary/5 active:scale-[0.98]';
        break;
      case 'text':
        variantClasses = 'bg-transparent text-primary hover:bg-primary/5 active:scale-[0.98]';
        break;
    }

    return (
      <button
        ref={ref}
        className={`h-14 font-label-md text-label-md rounded-lg flex items-center justify-center px-4 transition-all duration-200 ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
