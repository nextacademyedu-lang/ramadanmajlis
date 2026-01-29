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

    // Background Image URL (Using the uploaded mocup.png from public folder)
    const bgUrl = `${origin}/mocup.png`;

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
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            fontFamily: '"Outfit"',
            position: 'relative',
          }}
        >
          {/* ==========================================
              RIGHT COLUMN: User Photo & Details
             ========================================== */}

          {/* User Photo */}
          <div
            style={{
              position: 'absolute',
              right: '150px',
              top: '280px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #fbbf24', // Golden border
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#064e3b',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userPhotoUrl || 'https://via.placeholder.com/300'}
              alt={name}
              width="300"
              height="300"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* User Info Stack */}
          <div
            style={{
              position: 'absolute',
              right: '100px', // As per spec (center of right half approximately)
              top: '600px',
              width: '400px', // Area width to center content within
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Name */}
            <div style={{ fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 10, textTransform: 'uppercase' }}>
              {name.split(' ').slice(0, 2).join(' ')}
            </div>
            {/* Job Title */}
            <div style={{ fontSize: 22, color: '#00ffff', marginBottom: 8, fontWeight: 500 }}>
              {title.length > 30 ? title.substring(0, 30) + '...' : title}
            </div>
            {/* Company */}
            {company && (
              <div style={{ fontSize: 18, color: 'white', fontWeight: 400 }}>
                {company.length > 35 ? company.substring(0, 35) + '...' : company}
              </div>
            )}
          </div>

          {/* ==========================================
              BOTTOM SECTION: Nights, Date, Location
             ========================================== */}

          {/* Selected Nights - Bottom Left */}
          <div
            style={{
              position: 'absolute',
              left: '60px',
              bottom: '100px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              fontSize: 18,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.8,
            }}
          >
            {(night.toLowerCase().includes('all') || night.toLowerCase().includes('package')) ? (
              <div>All 3 Nights</div>
            ) : (
              night.split(',').map((n, i) => (
                <div key={i}>{n.trim()}</div>
              ))
            )}
            {(night.toLowerCase().includes('all') || night.toLowerCase().includes('package')) && (
              <div style={{ fontSize: 16, fontWeight: 400, opacity: 0.9 }}>20-22 March 2026</div>
            )}
          </div>

          {/* Event Date - Bottom Center */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '80px',
              fontSize: 22,
              fontWeight: 'bold',
              color: '#fbbf24',
              textAlign: 'center',
            }}
          >
            {date}
          </div>

          {/* Location - Bottom Center */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: 16,
              color: 'white',
              textAlign: 'center',
            }}
          >
            <span>📍</span>
            <span>{location || 'Creativa Innovation Hub - Giza'}</span>
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
