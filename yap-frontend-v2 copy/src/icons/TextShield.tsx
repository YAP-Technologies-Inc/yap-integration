import React, { SVGProps } from 'react';
export function TablerFileTextShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE */}
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M13 3v4a.997.997 0 0 0 1 1h4" />
        <path d="M11 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v3.5M8 9h1m-1 3.994h3m-3 4.003h2" />
        <path d="M21 15.994c0 4-2.5 6-3.5 6s-3.5-2-3.5-6c1 0 2.5-.5 3.5-1.5c1 1 2.5 1.5 3.5 1.5" />
      </g>
    </svg>
  );
}
