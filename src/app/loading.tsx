export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* AFU Logo — green square with leaf */}
        <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse"
          style={{ backgroundColor: '#5DB347' }}
        >
          <svg
            className="w-12 h-12 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Leaf shape */}
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 018 18c4-1 7-4 9-10z" />
            <path d="M17 8c-4 1-7 4-9 10" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: '#0A1628' }}
          >
            AFU
          </h1>
          <p
            className="text-xs font-semibold tracking-[0.25em] uppercase mt-1"
            style={{ color: '#5DB347' }}
          >
            African Farming Union
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-loading-bar"
            style={{ backgroundColor: '#5DB347' }}
          />
        </div>
      </div>

      {/* Inline keyframe for the loading bar animation */}
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
