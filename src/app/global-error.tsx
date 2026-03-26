'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #1B2A4A, #0f1a30)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem',
            }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
              Something Went Wrong
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', fontSize: '0.875rem' }}>
              An unexpected error occurred. Our team has been notified and is working on a fix.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#5DB347',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '9999px',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                Go Home
              </a>
            </div>
            {error.digest && (
              <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
                Error ID: {error.digest}
              </p>
            )}
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)' }}>
              African Farming Union · africanfarmingunion.org
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
