import React from 'react';

/**
 * Hyper-minimalist breathing-line loader.
 * A thin line expands and contracts with a fade — Vercel/Apple aesthetic.
 *
 * @param fullScreen  If true, centers in full viewport height. Default true.
 */
export function GlobalLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-full ${
        fullScreen ? 'min-h-screen bg-[#f6f6f8] dark:bg-[#111421]' : 'min-h-[40vh]'
      }`}
    >
      <div className="breathing-line h-[2px] rounded-full bg-primary/80" />
      <style>{`
        .breathing-line {
          width: 10%;
          max-width: 120px;
          animation: breathe 1.8s ease-in-out infinite;
        }
        @keyframes breathe {
          0%   { width: 10%; opacity: 0.2; }
          50%  { width: 50%; opacity: 1; }
          100% { width: 10%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

export default GlobalLoader;
