import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-6 text-xs text-slate-500 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            System Operational
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>Class Management Portal v2.0.0</span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <span>&copy; {new Date().getFullYear()} Class Management System</span>
          <a
            href="https://t.me/+I9OUYneewiA0NTc1"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Support Channel
          </a>
        </div>
      </div>
    </footer>
  );
}
