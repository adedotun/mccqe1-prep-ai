import React from 'react';

const ScoreIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <path
        d="M51.4,-45.3C62.9,-32.8,65.9,-16.4,65.9,0C65.9,16.4,62.9,32.8,51.4,45.3C39.9,57.8,19.9,66.4,-1.4,67.6C-22.7,68.7,-45.3,62.4,-55.9,48.2C-66.4,34,-64.8,11.9,-59.5,-6.6C-54.3,-25.1,-45.5,-40,-33.1,-52.3C-20.7,-64.6,-4.7,-74.3,10.6,-73.2C25.9,-72.1,51.4,-60.1,51.4,-45.3"
        fill="currentColor"
        transform="translate(100 100)"
      />
      <g
        transform="translate(100 100) scale(0.8)"
        fill="#3b82f6"
        stroke="#3b82f6"
        strokeWidth="3"
      >
        <path
          d="M-30,-20 a10,10 0 0,1 20,0 l5,-20 h-30 z"
          strokeLinejoin="round"
        />
        <path
          d="M-10,-20 v40 a30,30 0 0,0 20,0 v-40"
          strokeLinejoin="round"
        />
        <rect
          x="-25"
          y="20"
          width="50"
          height="10"
          rx="3"
          strokeLinejoin="round"
        />
        <rect
          x="-35"
          y="30"
          width="70"
          height="15"
          rx="5"
          strokeLinejoin="round"
        />
        {/* Plus Icon */}
        <g stroke="#fff" fill="#fff">
          <rect x="-13" y="-5" width="6" height="15" rx="2" />
          <rect x="-17" y="-1" width="14" height="6" rx="2" />
        </g>
      </g>
    </g>
  </svg>
);

export default ScoreIllustration;