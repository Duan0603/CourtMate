'use client';

import { useState } from 'react';

export function CoachAvatar({ name, src, className }: { name: string; src: string; className: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(' ').slice(-2).map(part => part[0]).join('');

  return (
    <div className={`relative shrink-0 overflow-hidden bg-blue-50 ${className}`}>
      <span role="img" aria-label={name} className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-[#1E5AA8]">
        {initials}
      </span>
      {!failed && <img src={src} alt="" onError={() => setFailed(true)} className="relative h-full w-full object-cover" />}
    </div>
  );
}
