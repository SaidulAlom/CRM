import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  collapsed?: boolean;
  customUrl?: string;
  className?: string;
  variant?: 'prism' | 'emerald' | 'amber' | 'violet';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  collapsed = false,
  customUrl,
  className = '',
  variant = 'prism',
}) => {
  const { organisation } = useCRM();
  const [imageError, setImageError] = useState(false);

  const activeUrl = customUrl !== undefined ? customUrl : organisation.logoUrl;

  const sizeDimensions = {
    xs: { box: 'w-6 h-6', iconSize: 24, font: 'text-xs', sub: 'text-[9px]' },
    sm: { box: 'w-8 h-8', iconSize: 32, font: 'text-sm', sub: 'text-[10px]' },
    md: { box: 'w-9 h-9', iconSize: 36, font: 'text-base', sub: 'text-[11px]' },
    lg: { box: 'w-11 h-11', iconSize: 44, font: 'text-lg', sub: 'text-xs' },
    xl: { box: 'w-14 h-14', iconSize: 56, font: 'text-xl', sub: 'text-sm' },
  }[size];

  // Gradients for SVG mark
  const gradientPresets = {
    prism: {
      from: '#6366f1', // Indigo 500
      via: '#8b5cf6',  // Violet 500
      to: '#06b6d4',   // Cyan 500
      glow: 'rgba(99, 102, 241, 0.35)',
      ring: 'ring-indigo-500/30',
    },
    emerald: {
      from: '#10b981', // Emerald 500
      via: '#059669',  // Emerald 600
      to: '#14b8a6',   // Teal 500
      glow: 'rgba(16, 185, 129, 0.35)',
      ring: 'ring-emerald-500/30',
    },
    amber: {
      from: '#f59e0b', // Amber 500
      via: '#f97316',  // Orange 500
      to: '#ef4444',   // Red 500
      glow: 'rgba(245, 158, 11, 0.35)',
      ring: 'ring-amber-500/30',
    },
    violet: {
      from: '#8b5cf6', // Violet 500
      via: '#d946ef',  // Fuchsia 500
      to: '#ec4899',   // Pink 500
      glow: 'rgba(139, 92, 246, 0.35)',
      ring: 'ring-violet-500/30',
    },
  }[variant];

  const renderIcon = () => {
    // If a custom image logo URL is supplied and hasn't errored
    if (activeUrl && !imageError) {
      return (
        <div
          className={`${sizeDimensions.box} rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-700/20 flex items-center justify-center shrink-0 p-0.5`}
        >
          <img
            src={activeUrl}
            alt={organisation.name || 'CRM Logo'}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      );
    }

    // Modern Geometric Apex Vector SVG Logo
    return (
      <div
        className={`${sizeDimensions.box} rounded-xl flex items-center justify-center shrink-0 relative transition-transform duration-200 group-hover:scale-105 shadow-sm ring-1 ${gradientPresets.ring}`}
        style={{
          background: `linear-gradient(135deg, ${gradientPresets.from}, ${gradientPresets.via})`,
          boxShadow: `0 4px 14px 0 ${gradientPresets.glow}`,
        }}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[78%] h-[78%] drop-shadow-xs"
        >
          <defs>
            <linearGradient id={`apex-grad-1-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id={`apex-grad-2-${size}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Left Wing / Isometric Apex facet */}
          <path
            d="M18 4L7 24L18 19L18 4Z"
            fill={`url(#apex-grad-1-${size})`}
            opacity="0.95"
          />
          {/* Right Wing / Isometric Apex facet */}
          <path
            d="M18 4L29 24L18 19L18 4Z"
            fill={`url(#apex-grad-2-${size})`}
            opacity="0.82"
          />
          {/* Dynamic Core Nexus Diamond */}
          <path
            d="M18 19L12 29L18 32L24 29L18 19Z"
            fill="#ffffff"
            opacity="0.98"
          />
          {/* Center Light Dot */}
          <circle cx="18" cy="18" r="1.75" fill="#4f46e5" />
        </svg>
      </div>
    );
  };

  if (collapsed) {
    return (
      <div className={`flex items-center justify-center ${className}`} title={organisation.name}>
        {renderIcon()}
      </div>
    );
  }

  if (!showText) {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  return (
    <div className={`flex items-center gap-2.5 overflow-hidden ${className}`}>
      {renderIcon()}
      <div className="truncate min-w-0">
        <h1 className={`font-bold text-white tracking-tight leading-tight truncate ${sizeDimensions.font}`}>
          {organisation.name || 'Apex Global'}
        </h1>
        <div className="flex items-center gap-1.5">
          <span className={`text-slate-400 font-medium truncate ${sizeDimensions.sub}`}>
            CRM Workspace
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="System Online" />
        </div>
      </div>
    </div>
  );
};
