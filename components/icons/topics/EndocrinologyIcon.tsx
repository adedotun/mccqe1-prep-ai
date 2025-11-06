import React from 'react';

const EndocrinologyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17l2.496-3.03c.52.922 1.63 1.623 2.828 1.623 1.996 0 3.61-1.613 3.61-3.61s-1.613-3.61-3.61-3.61c-1.198 0-2.308.7-2.828 1.623L11.42 15.17zM3 21l6.012-6.012" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M8.828 11.42L3 17.25a2.652 2.652 0 002.652 2.652l5.83-5.83" 
    />
  </svg>
);

export default EndocrinologyIcon;