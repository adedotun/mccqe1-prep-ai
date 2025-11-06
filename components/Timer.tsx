import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  duration: number;
  isPaused: boolean;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, isPaused, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, onTimeUp]);
  
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / duration) * circumference;

  const getTimeColor = () => {
    if (timeLeft <= 10) return 'text-red-500';
    if (timeLeft <= duration / 2) return 'text-yellow-500';
    return 'text-blue-600 dark:text-blue-400';
  }
  
  const getPulseClass = () => {
    // Start pulsing when 5 seconds are left
    if (!isPaused && timeLeft > 0 && timeLeft <= 5) {
      return 'animate-pulse-warning';
    }
    return '';
  }


  return (
    <div className={`relative w-12 h-12 ml-4 flex-shrink-0 ${getPulseClass()}`}>
      <svg className="w-full h-full" viewBox="0 0 44 44">
        <circle
          className="text-slate-200 dark:text-slate-700"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="22"
          cy="22"
        />
        <circle
          className={`${getTimeColor()} transition-all duration-500`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="22"
          cy="22"
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-bold text-sm ${getTimeColor()}`}>
        {timeLeft}
      </span>
    </div>
  );
};

export default Timer;