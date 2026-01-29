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
          {/* User Photo - Circular Mask */}
          <div
            style={{
              position: 'absolute',
              top: '254px',
              left: '111px',
              width: '455px',
              height: '455px',
              borderRadius: '50%',
              // border: '4px solid #10B981', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              // backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          >
            {userPhotoUrl ? (
              <img
                src={userPhotoUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt="User"
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                backgroundColor: '#064e3b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 150,
                color: '#10B981',
                fontWeight: 'bold'
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name, Title, Company - Below Photo */}
          <div
            style={{
              position: 'absolute',
              top: '750px',
              left: '120px',
              width: '450px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Name */}
            <div style={{ fontSize: 42, fontWeight: 'bold', color: '#10B981', marginBottom: 12, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {name}
            </div>
            {/* Title */}
            <div style={{ fontSize: 26, color: '#ecfdf5', marginBottom: 6 }}>
              {title}
            </div>
            {/* Company */}
            {company && (
              <div style={{ fontSize: 22, color: '#34d399' }}>
                {company}
              </div>
            )}
          </div>



          {/* Night Title & Location - Right Side */}
          <div
            style={{
              position: 'absolute',
              top: '500px',
              left: '680px',
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
            }}
          >
            {night && (
              <div style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#fbbf24', // Amber/Gold
                textTransform: 'uppercase',
                marginBottom: 16,
                lineHeight: 1.1,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}>
                {night}
              </div>
            )}

            {location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 24,
                color: '#d1fae5'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{location === 'Creativa Innovation Hub' ? 'Creativa Hub, Giza' : location}</span>
              </div>
            )}
          </div>

          {/* Date - Bottom Center */}
          <div
            style={{
              position: 'absolute',
              bottom: '88px',
              left: '0',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              fontSize: 28,
              color: '#fff',
              fontWeight: 600,
              letterSpacing: '1px',
            }}
          >
            {date}
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
