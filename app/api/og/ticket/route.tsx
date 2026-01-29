import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

// Text Variations for Dynamic Content
const textVariations = {
  greetings: [
    "i'm attending",
    "i'm joining",
    "see you at",
    "catch me at",
    "i'll be at"
  ],
  eventNames: [
    "Ramadan Majlis",
    "Ramadan Nights",
    "Majlis 2026"
  ],
  callsToAction: [
    "join me at one of largest business networking ramadan event in egypt",
    "be part of egypt's premier ramadan business gathering",
    "connect with entrepreneurs this ramadan in cairo",
    "network with top business leaders this holy month"
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);

    // Get Parameters from URL
    const name = searchParams.get('name') || 'Guest';
    const title = searchParams.get('title') || 'Entrepreneur';
    const company = searchParams.get('company') || '';
    const date = searchParams.get('date') || 'Ramadan 2026';
    const night = searchParams.get('night') || '';
    const location = searchParams.get('location') || 'Creativa Innovation Hub';
    const imagePath = searchParams.get('image');

    // Random Design Selection
    const designs = ['mocup1.png', 'mocup2.png'];
    const randomDesign = designs[Math.floor(Math.random() * designs.length)];
    const bgUrl = `${origin}/${randomDesign}`;

    // Random Text Selection
    const greeting = textVariations.greetings[Math.floor(Math.random() * textVariations.greetings.length)];
    const eventName = textVariations.eventNames[Math.floor(Math.random() * textVariations.eventNames.length)];
    const cta = textVariations.callsToAction[Math.floor(Math.random() * textVariations.callsToAction.length)];

    // Process User Photo
    let userPhotoUrl = null;
    if (imagePath && imagePath !== 'null' && imagePath !== 'undefined') {
      userPhotoUrl = imagePath.startsWith('http')
        ? imagePath
        : `${origin}${imagePath}`;
    }

    return new ImageResponse(
      (
        <div style={{
          width: '1200px',
          height: '1200px',
          display: 'flex',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}>
          {/* Background Image (Complete Design with Logos) */}
          <img
            src={bgUrl}
            alt="Background"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Dynamic Text Section - Left Side */}
          <div style={{
            position: 'absolute',
            left: '80px',
            top: '450px',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '500px'
          }}>
            {/* Greeting */}
            <div style={{
              fontSize: '52px',
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '10px',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
              lineHeight: '1.2'
            }}>
              {greeting}
            </div>

            {/* Event Name */}
            <div style={{
              fontSize: '56px',
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '30px',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
              lineHeight: '1.2'
            }}>
              {eventName}
            </div>

            {/* Underline Decoration */}
            <div style={{
              width: '380px',
              height: '4px',
              backgroundColor: '#fbbf24',
              marginBottom: '25px',
              borderRadius: '2px'
            }} />

            {/* Call to Action with Highlight */}
            <div style={{
              fontSize: '26px',
              color: 'white',
              lineHeight: '1.5',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
            }}>
              {cta.includes('largest business') ? (
                <>
                  {cta.split('largest business')[0]}
                  <span style={{
                    backgroundColor: '#fbbf2460',
                    color: '#fbbf24',
                    padding: '2px 10px',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    largest business
                  </span>
                  {cta.split('largest business')[1]}
                </>
              ) : (
                cta
              )}
            </div>
          </div>

          {/* Profile Photo - Right Side */}
          {userPhotoUrl && (
            <div style={{
              position: 'absolute',
              right: '180px',
              top: '380px',
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '5px solid #fbbf24',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
              display: 'flex'
            }}>
              <img
                src={userPhotoUrl}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </div>
          )}

          {/* User Information - Below Photo */}
          <div style={{
            position: 'absolute',
            right: '120px',
            top: '780px',
            width: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Name */}
            <div style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '2px 2px 6px rgba(0, 0, 0, 0.6)'
            }}>
              {name}
            </div>

            {/* Job Title */}
            <div style={{
              fontSize: '28px',
              color: '#22d3ee',
              marginBottom: '12px',
              fontWeight: '600',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
            }}>
              {title}
            </div>

            {/* Company Name */}
            {company && (
              <div style={{
                fontSize: '24px',
                color: '#e5e7eb',
                fontWeight: '500',
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
              }}>
                {company}
              </div>
            )}
          </div>

          {/* Bottom Section */}

          {/* Selected Nights - Bottom Left */}
          <div style={{
            position: 'absolute',
            left: '80px',
            bottom: '120px',
            display: 'flex',
            flexDirection: 'column',
            color: 'white',
            fontSize: '22px',
            fontWeight: 'bold',
            lineHeight: '1.6',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
          }}>
            {night.split(',').map((n, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                {n.trim()}
              </div>
            ))}
          </div>

          {/* Date - Bottom Center */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '110px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Event Date */}
            <div style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#fbbf24',
              marginBottom: '10px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
            }}>
              {date}
            </div>

            {/* Location */}
            <div style={{
              fontSize: '20px',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
            }}>
              📍 {location}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 1200,
      }
    );
  } catch (error) {
    console.error('OG Image Generation Error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
