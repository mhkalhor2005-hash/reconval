export default function RibbonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        stroke="#c6407e"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M40,14 C34,26 38,38 50,48 C60,56 67,70 71,96"
      />
      <path
        stroke="#8c2c5c"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M60,14 C66,26 62,38 50,48 C40,56 33,70 29,96"
      />
      <path fill="#fff" d="M71,96 L80,108 L71,104 L62,113 Z" />
      <path fill="#fff" d="M29,96 L20,108 L29,104 L38,113 Z" />
    </svg>
  );
}
