
import React from 'react';

const EncounterIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g>
      <path
        d="M40.7,-57.3C52.7,-48.9,62.3,-37.8,68.4,-24.9C74.5,-12,77.2,2.8,72.7,15.6C68.2,28.4,56.5,39.2,44.5,49.5C32.6,59.8,20.4,69.5,6,72.1C-8.4,74.7,-22.8,70.1,-35.8,62.7C-48.7,55.3,-60.2,45.1,-67.2,32.7C-74.2,20.4,-76.7,5.9,-73.9,-7.3C-71.2,-20.5,-63.3,-32.5,-53.4,-41.8C-43.5,-51.1,-31.6,-57.7,-19.6,-61.8C-7.6,-65.9,4.4,-67.5,16.2,-64.8C28,-62.1,39.8,-56.1,40.7,-57.3"
        fill="currentColor"
        transform="translate(100 100)"
      />
      <g
        transform="translate(100 100) scale(1.1)"
        fill="none"
        stroke="#475569"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M-30,-40 a15,15 0 0,1 30,0" />
        <path d="M-30,-40 v-10" />
        <path d="M0,-40 v-10" />
        <path d="M-30,-50 h30" />
        <path d="M-15,-25 v40" />
        <path d="M-25, 15 h20" />
        <circle cx="-15" cy="30" r="12" />
      </g>
    </g>
  </svg>
);

export default EncounterIllustration;
