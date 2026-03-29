import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AFU Country Page';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * S7.3: Dynamic OG image for country pages.
 * Shows the country name in a branded card.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const countryName = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #5DB347, transparent)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #5DB347, #4A9A38)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ display: 'flex' }}>
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22.23C7.28 18.33 9.09 14.75 17 13V17L22 11L17 5V8Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#5DB347', letterSpacing: '3px' }}>
            AFU
          </span>
        </div>
        <span
          style={{
            fontSize: '64px',
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {countryName}
        </span>
        <span
          style={{
            fontSize: '24px',
            fontWeight: 500,
            color: '#8899B0',
            marginTop: '16px',
            letterSpacing: '1px',
          }}
        >
          African Farming Union Operations
        </span>
      </div>
    ),
    { ...size }
  );
}
