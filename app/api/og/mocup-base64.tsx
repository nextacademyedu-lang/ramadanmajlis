import { ImageResponse } from '@vercel/og';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get dynamic data
    const name = searchParams.get('name') || 'Guest Name';
    const title = searchParams.get('title') || 'Founder';
    const company = searchParams.get('company') || 'Tech Company';

    const element = (
      <div style={{
        width: '1200px',
        height: '1200px',
        display: 'flex',
        position: 'relative',
        fontFamily: 'sans-serif',
        background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
      }}>
        <div style={{
          position: 'absolute',
          inset: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px'
        }}>
          <div style={{
            fontSize: '72px',
            color: '#ffffff',
            fontWeight: 800,
            marginBottom: '20px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            textTransform: 'uppercase'
          }}>
            {name}
          </div>

          <div style={{
            fontSize: '42px',
            color: '#fbbf24',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            <span>{title}</span>
            {company && (
              <span style={{ marginLeft: '15px', color: '#e5e7eb' }}> | {company}</span>
            )}
          </div>

          <div style={{
            marginTop: '40px',
            fontSize: '24px',
            color: '#10b981',
            fontWeight: 600
          }}>
            Ramadan Majlis 2026
          </div>
        </div>
      </div>
    );

    return new ImageResponse(element, {
      width: 1200,
      height: 1200,
    });
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}