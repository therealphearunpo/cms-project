import React from 'react';

const variantStyles = {
  success:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium',
  warning:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium',
  info: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium',
  neutral:
    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 font-medium',
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
