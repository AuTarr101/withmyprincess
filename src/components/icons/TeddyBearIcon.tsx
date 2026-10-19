import React from 'react';

export default function TeddyBearIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ears */}
      <circle cx="27" cy="28" r="14" fill="currentColor" fillOpacity="0.15" />
      <circle cx="73" cy="28" r="14" fill="currentColor" fillOpacity="0.15" />
      <circle cx="27" cy="28" r="7" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />
      <circle cx="73" cy="28" r="7" fill="currentColor" fillOpacity="0.3" strokeWidth="2" />

      {/* Head */}
      <circle cx="50" cy="52" r="33" fill="currentColor" fillOpacity="0.08" />

      {/* Eyes */}
      <circle cx="39" cy="47" r="3.5" fill="currentColor" />
      <circle cx="61" cy="47" r="3.5" fill="currentColor" />
      {/* Eye glints */}
      <circle cx="37.5" cy="45.5" r="1" fill="#FFFFFF" stroke="none" />
      <circle cx="59.5" cy="45.5" r="1" fill="#FFFFFF" stroke="none" />

      {/* Snout */}
      <ellipse cx="50" cy="59" rx="14" ry="10.5" fill="currentColor" fillOpacity="0.18" />
      {/* Nose */}
      <path d="M46 55.5 C48 53.5, 52 53.5, 54 55.5 C53 58, 47 58, 46 55.5 Z" fill="currentColor" />
      {/* Smile */}
      <path d="M50 58.5 L50 63.5" strokeWidth="3" />
      <path d="M43.5 62 C46 65, 50 65, 50 63.5 C50 65, 54 65, 56.5 62" strokeWidth="3" />

      {/* Cheeks */}
      <ellipse cx="32" cy="56" rx="4" ry="2" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <ellipse cx="68" cy="56" rx="4" ry="2" fill="currentColor" fillOpacity="0.25" stroke="none" />
    </svg>
  );
}
