'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  unlockTime: bigint;
  className?: string;
}

export default function Countdown({ unlockTime, className = '' }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const target = Number(unlockTime);
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }

      const days = Math.floor(difference / 86400);
      const hours = Math.floor((difference % 86400) / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      const seconds = difference % 60;

      setTimeRemaining({ days, hours, minutes, seconds, total: difference });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [unlockTime]);

  if (timeRemaining.total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-lg font-bold text-green-600">Ready to claim!</p>
        <p className="text-sm text-gray-600">Your tokens are now unlocked</p>
      </div>
    );
  }

  // Different display formats based on time remaining
  const getTimeDisplay = () => {
    const { days, hours, minutes, seconds } = timeRemaining;

    // More than 7 days - show days only
    if (days > 7) {
      return (
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{days}</div>
            <div className="text-xs text-gray-600 uppercase">Days</div>
          </div>
        </div>
      );
    }

    // 1-7 days - show days and hours
    if (days >= 1) {
      return (
        <div className="flex justify-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{days}</div>
            <div className="text-xs text-gray-600 uppercase">Days</div>
          </div>
          <div className="text-2xl font-light text-gray-400">:</div>
          <div className="text-center">
            <div className="text-2xl font-bold">{hours}</div>
            <div className="text-xs text-gray-600 uppercase">Hours</div>
          </div>
        </div>
      );
    }

    // Less than 24 hours - show hours, minutes, seconds with urgency
    const urgencyColor = hours < 1 ? 'text-orange-600' : 'text-blue-600';
    
    return (
      <div className={`flex justify-center gap-3 ${urgencyColor}`}>
        <div className="text-center">
          <div className="text-2xl font-bold">{String(hours).padStart(2, '0')}</div>
          <div className="text-xs uppercase opacity-75">Hr</div>
        </div>
        <div className="text-2xl font-light opacity-50">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold">{String(minutes).padStart(2, '0')}</div>
          <div className="text-xs uppercase opacity-75">Min</div>
        </div>
        <div className="text-2xl font-light opacity-50">:</div>
        <div className="text-center">
          <div className="text-2xl font-bold">{String(seconds).padStart(2, '0')}</div>
          <div className="text-xs uppercase opacity-75">Sec</div>
        </div>
      </div>
    );
  };

  // Special styling for last 24 hours
  const isUrgent = timeRemaining.total < 86400;
  const isCritical = timeRemaining.total < 3600;

  return (
    <div className={`${className} ${isCritical ? 'animate-pulse' : ''}`}>
      <div className="text-center">
        {isUrgent && (
          <p className={`text-xs font-medium mb-2 ${
            isCritical ? 'text-red-600' : 'text-orange-600'
          }`}>
            {isCritical ? '⏰ Less than 1 hour!' : '⏰ Less than 24 hours!'}
          </p>
        )}
        {getTimeDisplay()}
        {!isUrgent && (
          <p className="text-xs text-gray-500 mt-2">
            Time remaining until unlock
          </p>
        )}
      </div>
    </div>
  );
}