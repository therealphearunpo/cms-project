import React, { useEffect, useState } from 'react';

import { Outlet } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuEnabled, setIsMenuEnabled] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      {isMenuEnabled && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onMenuVisibilityToggle={() => {
            setIsMenuEnabled(false);
            setIsSidebarOpen(false);
          }}
        />
      )}

      {/* Main content area — offset by sidebar width on desktop */}
      <div className={`flex flex-col flex-1 min-w-0 ${isMenuEnabled ? 'lg:ml-64' : ''}`}>
        <Header
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
          isMenuEnabled={isMenuEnabled}
          onMenuVisibilityToggle={() => {
            setIsMenuEnabled((prev) => {
              const next = !prev;
              if (!next) setIsSidebarOpen(false);
              return next;
            });
          }}
        />

        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 2xl:p-10 min-w-0">
          {children || <Outlet />}
        </main>

        <Footer />
      </div>
    </div>
  );
}
