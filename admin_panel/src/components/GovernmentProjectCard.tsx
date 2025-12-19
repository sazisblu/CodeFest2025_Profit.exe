'use client';
import { useState } from 'react';

interface ProjectCardProps {
  title: string;
  address: string;
  details: {
    budget?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    contractor?: string;
    status?: string;
    fiscalYear?: string;
    projectCode?: string;
  };
  onCardClick?: () => void;
  onDelete?: () => void;
  onRequestDelete?: () => void;
}

export const GovernmentProjectCard = ({ title, address, details, onCardClick, onDelete, onRequestDelete }: ProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    if (onCardClick) onCardClick();
    setIsExpanded(v => !v);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer select-none transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 max-w-[320px] mx-auto"
    >
      <div
        className="relative border overflow-hidden shadow-sm"
        style={{
          background: '#f4f0e8',
          borderColor: '#d4c4a8',
          minHeight: 160,
          aspectRatio: '1/1',
          boxShadow: '0 4px 20px rgba(139, 115, 85, 0.25), 0 2px 8px rgba(139, 115, 85, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Left binding - exactly 3 vertical blue lines close together */}
        <div className="absolute left-0 top-0 bottom-0 w-12">
          {/* Left side background strip - more distinct color covering full left area */}
          <div 
            className="absolute top-0 bottom-0 left-0 right-0"
            style={{
              background: '#e6ddd1'
            }}
          ></div>
          
          {/* Two vertical blue lines - keep only two */}
          {/* binding lines removed as requested */}
          
          {/* Blue knot/tie */}
          <div className="absolute left-6 top-[42%] transform -translate-y-1/2">
            <svg width="24" height="32" viewBox="0 0 24 32">
              <defs>
                <linearGradient id="juteGradTop" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d6a87a" />
                  <stop offset="100%" stopColor="#a67852" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="11" r="4" fill="url(#juteGradTop)" stroke="#7a4f33" strokeWidth="2"/>
            </svg>
          </div>

          <div className="absolute left-6 top-[62%] transform -translate-y-1/2">
            <svg width="24" height="32" viewBox="0 0 24 32">
              <defs>
                <linearGradient id="juteGradBottom" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d6a87a" />
                  <stop offset="100%" stopColor="#a67852" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="11" r="4" fill="url(#juteGradBottom)" stroke="#7a4f33" strokeWidth="2"/>
            </svg>
          </div>
          {/* Thin brown vertical line between knots (centered under knot centers) */}
          <div className="absolute left-6 pointer-events-none z-30" style={{ top: '42%', height: '18%', width: '24px' }}>
            <div style={{ position: 'absolute', left: 11, top: 0, width: 2, height: '100%', background: '#7a4f33', borderRadius: 2 }} />
          </div>
        </div>

        {/* Main content */}
        <div className="pl-20 pr-6 py-4 flex flex-col items-center text-center h-full">
          {/* Government Emblem */}
          <div className="mb-3 flex justify-center">
            <img 
              src="/emblem1.png" 
              alt="Government Emblem" 
              className="h-26 w-26 object-contain"
            />
          </div>

          {/* Three vertical decorative lines */}
          <div className="mb-3 flex items-center gap-2">
            <div className="w-[2px] h-12 bg-[#4a4a4a] rounded"></div>
            <div className="w-[2px] h-16 bg-[#2d2d2d] rounded"></div>
            <div className="w-[2px] h-12 bg-[#4a4a4a] rounded"></div>
          </div>

          {/* Title */}
          <h2 
            className="text-xl font-black mb-2 leading-tight px-2"
            style={{ 
              fontFamily: 'Times, serif',
              color: '#5d4037',
              fontSize: '1.375rem',
              fontWeight: '900'
            }}
          >
            {title}
          </h2>

          {/* Address */}
          <p 
            className="text-xs uppercase tracking-wider mb-2 px-2"
            style={{ 
              color: '#8d6e63',
              letterSpacing: '0.1em'
            }}
          >
            {address}
          </p>

          {/* Down arrow */}
          <div className="mt-auto mb-2">
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              style={{ color: '#8d6e63' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Expandable content */}
          <div className={`w-full transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-96 mt-6' : 'max-h-0'}`}>
            <div className="border-t pt-4 space-y-3" style={{ borderColor: '#d4c4a8' }}>
              {details.description && (
                <div className="text-sm" style={{ color: '#5d4037' }}>
                  <strong className="text-xs" style={{ color: '#8d6e63' }}>Description:</strong>
                  <p className="mt-1">{details.description}</p>
                </div>
              )}
              {details.budget && (
                <div className="text-sm" style={{ color: '#5d4037' }}>
                  <strong className="text-xs" style={{ color: '#8d6e63' }}>Budget:</strong>
                  <p className="mt-1 font-semibold">{details.budget}</p>
                </div>
              )}
              {details.status && (
                <div className="mt-3">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ 
                      backgroundColor: '#e8f5e8', 
                      color: '#2e7d32',
                      borderColor: '#c8e6c9'
                    }}
                  >
                    {details.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete (dustbin) button - bottom-right */}
        {(onDelete || onRequestDelete) && (
          <div className="absolute bottom-3 right-3 z-40">
            <button
              onClick={(e) => { e.stopPropagation(); if (onRequestDelete) onRequestDelete(); else if (onDelete) onDelete(); }}
              title="Delete project"
              aria-label="Delete project"
              className="w-8 h-8 text-red-700 flex items-center justify-center transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                <path d="M3 6h18v2H3V6zm2 3h14l-1 11H6L5 9zm3-6h6l1 1H7l1-1z" />
              </svg>
            </button>
          </div>
        )}

        {/* Paper texture overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: 0.6
          }}
        />
      </div>
    </div>
  );
};

export default GovernmentProjectCard;