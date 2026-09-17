import React, { HTMLAttributes } from 'react';
import { cn } from './Button';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'copper' | 'neutral' | 'warning' | 'success' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  children,
  ...props
}) => {
  const variants = {
    copper:
      'bg-[#d47a3a]/15 text-[#e08b4c] border border-[#d47a3a]/30 font-medium',
    neutral:
      'bg-[#1a1a22] text-[#c5bcae] border border-[#272732]',
    warning:
      'bg-[#2c1d10] text-[#e69d43] border border-[#523315] font-medium',
    success:
      'bg-[#122316] text-[#4ade80] border border-[#1b3d22] font-medium',
    outline:
      'border border-[#282834] text-[#8e8579] bg-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-mono tracking-wide select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
