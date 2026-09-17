import React, { HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from './Button';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
}

export const Progress: React.FC<ProgressProps> = ({
  className,
  value,
  max = 100,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-[#1c1c24]', className)}
      {...props}
    >
      <div
        className="h-full bg-[#d47a3a] transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const Separator: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('shrink-0 bg-[#202028] h-[1px] w-full', className)}
    {...props}
  />
);

export const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  className?: string;
}> = ({ content, children, className }) => {
  return (
    <div className={cn('relative group inline-flex', className)}>
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-50">
        <div className="rounded bg-[#1a1a22] border border-[#2b2b36] px-2 py-1 text-[11px] text-[#efe6d4] shadow-md whitespace-nowrap">
          {content}
        </div>
        <div className="w-1.5 h-1.5 bg-[#1a1a22] border-r border-b border-[#2b2b36] transform rotate-45 -mt-1" />
      </div>
    </div>
  );
};

export const Table = React.forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-xs text-left border-collapse', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b [&_tr]:border-[#202028]', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-[#1b1b22] transition-colors hover:bg-[#15151b] data-[state=selected]:bg-[#181820]',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-9 px-3 text-left align-middle font-mono text-[11px] uppercase tracking-wider text-[#8e8579]',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-3 align-middle text-[#efe6d4] font-mono text-xs', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
