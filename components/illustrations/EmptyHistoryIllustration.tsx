import React from 'react';

const EmptyHistoryIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <path
        d="M40.7,-57.3C52.7,-48.9,62.3,-37.8,68.4,-24.9C74.5,-12,77.2,2.8,72.7,15.6C68.2,28.4,56.5,39.2,44.5,49.5C32.6,59.8,20.4,69.5,6,72.1C-8.4,74.7,-22.8,70.1,-35.8,62.7C-48.7,55.3,-60.2,45.1,-67.2,32.7C-74.2,20.4,-76.7,5.9,-73.9,-7.3C-71.2,-20.5,-63.3,-32.5,-53.4,-41.8C-43.5,-51.1,-31.6,-57.7,-19.6,-61.8C-7.6,-65.9,4.4,-67.5,16.2,-64.8C28,-62.1,39.8,-56.1,40.7,-57.3"
        fill="currentColor"
        transform="translate(100 100)"
      />
      <g
        transform="translate(100 100) scale(0.9)"
        fill="none"
        stroke="#475569"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="-40" y="-55" width="80" height="110" rx="8" fill="#fff" className="dark:fill-slate-800" />
        <path d="M-25 -35 h 50" />
        <path d="M-25 -20 h 50" />
        <path d="M-25 -5 h 20" />
        <g stroke="#3b82f6" strokeWidth="5">
          <path d="M-25 20 h 50" />
          <path d="M-25 35 h 50" />
        </g>
      </g>
    </g>
  </svg>
);

export default EmptyHistoryIllustration;