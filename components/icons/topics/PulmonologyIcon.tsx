import React from 'react';

const PulmonologyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.09 7.5a4.5 4.5 0 118.82 2.146l.16.804a5.25 5.25 0 01-5.41 5.41l-.804.16a4.5 4.5 0 11-2.766-8.52zM17.91 16.5a4.5 4.5 0 11-8.82-2.146l-.16-.804a5.25 5.25 0 015.41-5.41l.804-.16a4.5 4.5 0 112.766 8.52z"
    />
  </svg>
);

export default PulmonologyIcon;