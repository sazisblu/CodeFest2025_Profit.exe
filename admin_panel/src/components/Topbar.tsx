'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface TopbarProps {
  activeTab: string;
  onLogout: () => void;
}

export default function Topbar({ activeTab, onLogout }: TopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const setVar = () => {
      const h = rootRef.current?.getBoundingClientRect().height || 0;
      document.documentElement.style.setProperty('--topbar-height', `${Math.ceil(h)}px`);
    };

    setVar();
    window.addEventListener('resize', setVar);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', setVar);
    };
  }, []);

  // notifications removed per UI change

  const getTabTitle = (tab: string) => {
    switch(tab) {
      case 'dashboard': return 'Dashboard';
      case 'citizen-issues': return 'Citizen Issues';
      case 'citizen-proposals': return 'Proposals';
      case 'active-projects': return 'Active Projects';
      case 'reports': return 'Reports';
      case 'skills': return 'Skills & Technologies';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div ref={rootRef} className={`px-6 py-6 transition-colors duration-200 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200/60' : 'bg-gradient-to-r from-blue-100/80 via-blue-50/50 via-blue-25/30 to-transparent backdrop-blur-md'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">{getTabTitle(activeTab)}</h1>
          <p className="text-sm text-slate-600">Monitor and manage your municipal services</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
              <input
              type="text"
              placeholder="Search issues, projects..."
                className="pl-10 pr-4 py-2.5 w-96 border border-blue-500/60 rounded-xl bg-white/60 backdrop-blur-md text-sm text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:bg-white/80 transition-all duration-300 shadow-sm mr-6"
            />
          </div>

          {/* Chat Button */}
          {/* Notifications */}
          {/* Subtle Divider */}
          <div className="h-6 w-px bg-blue-300/60"></div>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/40">
                <span className="text-white font-semibold text-sm">AU</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-700">Admin User</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (() => {
              const dropdown = (
                <div
                  className="fixed w-64 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border-0 py-3 z-[9999] ring-1 ring-blue-200/50"
                  style={{ top: 'calc(var(--topbar-height) + 12px)', right: '1.5rem' }}
                  role="dialog"
                >
                  <div className="px-4 py-3 border-b border-blue-100/60 text-center">
                    <div className="mx-auto w-28 h-28 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                      <div className="w-24 h-24">
                        <DotLottieReact
                          src="https://lottie.host/8c395a30-4d39-4d59-94e2-bc22c8ab3e0b/Ke6pE3fRr9.lottie"
                          loop
                          autoplay
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <button
                      onClick={onLogout}
                      className="w-full text-center px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 rounded-md transition-all duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              );
              if (typeof document !== 'undefined') return createPortal(dropdown, document.body);
              return dropdown;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}