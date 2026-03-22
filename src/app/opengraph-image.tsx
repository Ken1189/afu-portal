import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'African Farming Union - Agriculture Development Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0F1B33 0%, #1B2A4A 40%, #1E3050 100%)',
        }}
      >
        {/* Subtle green gradient glow — bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(93,179,71,0.18) 0%, rgba(93,179,71,0.05) 50%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top decorative line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #5DB347 0%, #5DB347 30%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Top section: Logo + branding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Logo: green square with leaf */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #5DB347 0%, #4A9A38 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(93,179,71,0.35)',
              }}
            >
              {/* Leaf icon using SVG path */}
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: 'flex' }}
              >
                <path
                  d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22.23C7.28 18.33 9.09 14.75 17 13V17L22 11L17 5V8Z"
                  fill="white"
                />
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '42px',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '4px',
                  lineHeight: 1,
                }}
              >
                AFU
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#5DB347',
                  letterSpacing: '3px',
                  lineHeight: 1.4,
                }}
              >
                AFRICAN FARMING UNION
              </span>
            </div>
          </div>
        </div>

        {/* Main heading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '-20px' }}>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.15,
              maxWidth: '900px',
              letterSpacing: '-0.5px',
            }}
          >
            {"Africa's Agriculture Development Bank + Operating Platform"}
          </span>

          {/* Subtitle */}
          <span
            style={{
              fontSize: '22px',
              fontWeight: 400,
              color: '#8899B0',
              lineHeight: 1.4,
              letterSpacing: '0.5px',
            }}
          >
            Financing &nbsp;•&nbsp; Inputs &nbsp;•&nbsp; Processing &nbsp;•&nbsp; Offtake &nbsp;•&nbsp; Trade Finance &nbsp;•&nbsp; Training
          </span>
        </div>

        {/* Bottom section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#5DB347',
                display: 'flex',
              }}
            />
            <span
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#5DB347',
                letterSpacing: '1px',
              }}
            >
              10 Countries &nbsp;•&nbsp; $100M Seed Round
            </span>
          </div>

          <span
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#4A5D78',
              letterSpacing: '1px',
            }}
          >
            afu.africa
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
