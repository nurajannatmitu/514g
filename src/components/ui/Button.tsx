import React, { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'copper' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'outline', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 rounded-lg cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d47a3a]';

    const variants = {
      copper:
        'bg-[#d47a3a] text-[#0a0a0c] font-semibold hover:bg-[#e08b4c] active:bg-[#be6a2e] shadow-[0_1px_3px_rgba(0,0,0,0.5)]',
      outline:
        'border border-[#272730] bg-[#121216] text-[#efe6d4] hover:border-[#383844] hover:bg-[#17171d]',
      secondary:
        'bg-[#18181f] border border-[#272730] text-[#efe6d4] hover:bg-[#22222a]',
      ghost:
        'text-[#c5bcae] hover:text-[#efe6d4] hover:bg-[#181820]',
      destructive:
        'bg-[#231212] border border-[#421b1b] text-[#f87171] hover:bg-[#321717]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 h-8',
      md: 'text-sm px-3.5 py-2 h-9',
      lg: 'text-base px-4 py-2.5 h-11',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
