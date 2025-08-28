'use client';

import { getEnvironmentBadge } from '../lib/config';

export default function EnvironmentBadge() {
  const badge = getEnvironmentBadge();
  
  if (!badge) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse`}>
        {badge.text}
      </div>
    </div>
  );
}