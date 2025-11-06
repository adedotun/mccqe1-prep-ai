import React from 'react';

const HeroIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <path
        d="M40.7,-57.3C52.7,-48.9,62.3,-37.8,68.4,-24.9C74.5,-12,77.2,2.8,72.7,15.6C68.2,28.4,56.5,39.2,44.5,49.5C32.6,59.8,20.4,69.5,6,72.1C-8.4,74.7,-22.8,70.1,-35.8,62.7C-48.7,55.3,-60.2,45.1,-67.2,32.7C-74.2,20.4,-76.7,5.9,-73.9,-7.3C-71.2,-20.5,-63.3,-32.5,-53.4,-41.8C-43.5,-51.1,-31.6,-57.7,-19.6,-61.8C-7.6,-65.9,4.4,-67.5,16.2,-64.8C28,-62.1,39.8,-56.1,40.7,-57.3"
        fill="currentColor"
        transform="translate(100 100)"
      />
      <g
        transform="translate(100 100) scale(0.9)"
        fill="#475569"
        stroke="#475569"
        strokeWidth="2"
      >
        <path
          d="M9.1,6.3c0-3.3,0.3-6.8,2-9.6C12.4-5.3,14-7,16.2-8.3c4-2.4,8.8-2,13.1,0.2c5.9,3,9.5,8.8,11.2,15.1 c1.2,4.4,2.7,8.7,4.8,12.7c3.9,7.4,9.4,13.7,12.3,21.5c2.3,6.2,1.3,13.1-2.2,18.5c-3.6,5.6-9.5,8.9-15.9,9.8 c-8.2,1.2-16.5-0.1-24.1-3c-7.9-3-15.1-8-20.5-14.3c-4.9-5.7-8.1-12.7-9.5-20.1C-4,28-4.2,18.5-1.1,9.8C0.6,4.6,3.6-0.2,9.1,6.3z"
          transform="translate(-20 -40) scale(1.4)"
        />
        <circle cx="0" cy="-45" r="8" />
        <path
          d="M0-35 v35"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M0,0 a25,25 0 1,1 0,50 a30,30 0 0,0 0,-50"
          fill="none"
          strokeWidth="4"
        />
        <path
          d="M-15,65 h30"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </g>
    </g>
  </svg>
);

export default HeroIllustration;