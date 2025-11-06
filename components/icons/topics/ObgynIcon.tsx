import React from 'react';

const ObgynIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M11.35 3.836c-.566-1.562-2.133-2.528-3.754-2.105A3.375 3.375 0 005.156 4.1C4.46 5.68 5.08 7.42 6.42 8.356c1.34 1.042 3.16.89 4.394-.492a.75.75 0 011.132.933c-1.353 1.635-3.65 2.155-5.592 1.258A4.875 4.875 0 013 8.25C3 5.42 5.42 3 8.25 3c.873 0 1.693.242 2.422.656.34.195.666.42.978.68z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12.647 16.353c1.34-1.042 3.16-.89 4.394-.492a.75.75 0 001.132.933c-1.353 1.635-3.65 2.155-5.592 1.258A4.875 4.875 0 0110.5 15.75c0-2.83 2.42-5.25 5.25-5.25.873 0 1.693.242 2.422.656a4.875 4.875 0 012.33 4.544c-.566 1.562-2.133 2.528-3.754 2.105a3.375 3.375 0 01-2.496-2.496z"
    />
  </svg>
);

export default ObgynIcon;