import React from 'react';

export default function FluffyPuppyIcon({ className = 'w-16 h-16' }: { className?: string }) {
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
      {/* Floppy Fluffy Ears */}
      <path
        d="M26 34 C16 34, 12 46, 14 60 C16 70, 24 74, 28 66 C30 62, 30 46, 28 38 Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M74 34 C84 34, 88 46, 86 60 C84 70, 76 74, 72 66 C70 62, 70 46, 72 38 Z"
        fill="currentColor"
        fillOpacity="0.2"
      />

      {/* Fluffy Head & Top Tufts */}
      <path
        d="M34 29 C40 25, 45 28, 50 26 C55 28, 60 25, 66 29 C74 36, 76 46, 76 56 C76 71, 64 77, 50 77 C36 77, 24 71, 24 56 C24 46, 26 36, 34 29 Z"
        fill="currentColor"
        fillOpacity="0.08"
      />

      {/* Puppy Eyes */}
      <circle cx="38" cy="48" r="4" fill="currentColor" />
      <circle cx="62" cy="48" r="4" fill="currentColor" />
      {/* Eye glints */}
      <circle cx="36.5" cy="46" r="1.5" fill="#FFFFFF" stroke="none" />
      <circle cx="60.5" cy="46" r="1.5" fill="#FFFFFF" stroke="none" />

      {/* Fluffy Muzzle */}
      <ellipse cx="50" cy="59" rx="13" ry="9" fill="currentColor" fillOpacity="0.16" />

      {/* Nose */}
      <path
        d="M45.5 56 C47 54, 53 54, 54.5 56 C53.5 59.5, 46.5 59.5, 45.5 56 Z"
        fill="currentColor"
      />
      {/* Tongue / Smile */}
      <path d="M50 58.5 L50 63" strokeWidth="2.5" />
      <path d="M45 62 C47.5 65, 50 64, 50 63 C50 64, 52.5 65, 55 62" strokeWidth="2.5" />
      <path
        d="M48 64 C48 68, 52 68, 52 64 Z"
        fill="#FF8A9E"
        stroke="#E0526B"
        strokeWidth="1.5"
      />

      {/* Rosy Cheeks */}
      <circle cx="31" cy="57" r="3.5" fill="#FF8A9E" fillOpacity="0.3" stroke="none" />
      <circle cx="69" cy="57" r="3.5" fill="#FF8A9E" fillOpacity="0.3" stroke="none" />
    </svg>
  );
}
