import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);

    // Get parameters
    const name = searchParams.get('name') || 'Guest';
    const title = searchParams.get('title') || 'Entrepreneur';
    const company = searchParams.get('company') || '';
    const date = searchParams.get('date') || 'Ramadan 2026';
    const night = searchParams.get('night') || '';
    const location = searchParams.get('location') || '';
    const imagePath = searchParams.get('image');

    // Background Image URL (Using the uploaded event share.png from public folder)
    const bgUrl = `${origin}/event%20share.png`;

    // User Photo URL 
    let userPhotoUrl = null;
    if (imagePath && imagePath !== 'null' && imagePath !== 'undefined') {
      if (imagePath.startsWith('http')) {
        userPhotoUrl = imagePath;
      } else {
        // Clean the path
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        userPhotoUrl = `${origin}${cleanPath.split('/').map(p => encodeURIComponent(p)).join('/').replace(/%20/g, ' ')}`;
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: '1080px 1080px',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            fontFamily: 'sans-serif',
            color: 'white',
            position: 'relative',
          }}
        >
          {/* ==========================================
            RIGHT COLUMN: User Photo & Details
           ========================================== */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: '80px', // Position on the Right
              top: '250px',
              width: '400px',
              textAlign: 'center',
            }}
          >
            {/* User Photo Circle */}
            <div
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '6px solid #10b981', // Emerald border
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
                backgroundColor: '#064e3b',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userPhotoUrl || 'https://via.placeholder.com/400'}
                alt={name}
                width="240"
                height="240"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* User Data */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: 'white', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '-0.02em', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                {name.split(' ').slice(0, 2).join(' ')}
              </div>

              {/* Gradient Line Separator */}
              <div style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)', marginBottom: 12 }}></div>

              <div style={{ fontSize: 24, fontWeight: 500, color: '#fbbf24', marginBottom: 4, letterSpacing: '0.05em' }}>
                {title.length > 30 ? title.substring(0, 30) + '...' : title}
              </div>
              {company && (
                <div style={{ fontSize: 20, fontWeight: 400, color: '#a7f3d0' }}>
                  {company.length > 35 ? company.substring(0, 35) + '...' : company}
                </div>
              )}
            </div>
          </div>

          {/* ==========================================
            BOTTOM LEFT: Night Title & Date
           ========================================== */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
            }}
          >
            {/* Night Name */}
            <div style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1,
              marginBottom: 10,
              textTransform: 'uppercase',
              textShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
              {night || 'Ramadan Majlis'}
            </div>

            {/* Date */}
            <div style={{
              fontSize: 28,
              fontWeight: 500,
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{date}</span>
            </div>
          </div>

          {/* ==========================================
            BOTTOM CENTER: Location
           ========================================== */}
          <div
            style={{
              position: 'absolute',
              bottom: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: 26,
                fontWeight: 600,
                color: '#d1fae5',
                background: 'rgba(6, 78, 59, 0.6)',
                padding: '10px 24px',
                borderRadius: '50px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                backdropFilter: 'blur(4px)'
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{location === 'Creativa Innovation Hub' ? 'Creativa Hub, Giza' : location}</span>
              </div>
            )}
          </div>

        </div>
      ),
      {
        width: 1080,
        height: 1080,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
