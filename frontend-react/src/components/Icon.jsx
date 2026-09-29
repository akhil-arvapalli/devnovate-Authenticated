const PATHS = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8 10h8M8 14h6" /></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  dots: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 21h16" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  heart: <path d="M20.8 8.9c0 5.2-8.8 10.1-8.8 10.1S3.2 14.1 3.2 8.9A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.8 2.3Z" />,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.2-.6L4 20l1.6-3.5A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  refresh: <path d="M20 11a8 8 0 1 0 1 4M20 4v7h-7" />,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  send: <><path d="m21 3-7.5 18-3.5-7-7-3.5z" /><path d="M10 14 21 3" /></>,
  shield: <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6z" />,
  spark: <><path d="m12 2 1.5 7.5L21 11l-7.5 1.5L12 20l-1.5-7.5L3 11l7.5-1.5z" /><path d="m19 17 .5 2.5L22 20l-2.5.5L19 23l-.5-2.5L16 20l2.5-.5z" /></>,
  stethoscope: <><path d="M6 3v5a4 4 0 0 0 8 0V3M4 3h4M12 3h4" /><path d="M14 13a5 5 0 1 0 5 5v-1a2 2 0 1 1 4 0v1" /></>,
  tag: <><path d="M3 3h7l11 11-7 7L3 10z" /><circle cx="7.5" cy="7.5" r="1" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  warning: <><path d="m12 3 10 18H2z" /><path d="M12 9v5M12 17h.01" /></>,
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export default function Icon({ name, size = 18, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.spark}
    </svg>
  );
}
