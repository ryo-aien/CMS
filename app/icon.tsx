import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#e91e8c',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'serif',
            letterSpacing: '-1px',
          }}
        >
          C
        </div>
      </div>
    ),
    size
  );
}
