import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = (searchParams.get('name') || 'Guest').trim();
        const title = (searchParams.get('title') || '').trim();
        const company = (searchParams.get('company') || '').trim();
        const night = (searchParams.get('night') || '').trim();
        const location = (searchParams.get('location') || '').trim();
        const photoUrl = (searchParams.get('photo') || '').trim();

        // Use the public URL for the mocup image
        // We use the absolute URL to ensure it works in the edge function
        const mocupUrl = 'https://ramadanmajlis.nextacademyedu.com/mocup1.png';

        return new ImageResponse(
            (
                <div style={{
                    width: '1200px',
                    height: '1200px',
                    display: 'flex',
                    position: 'relative',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                    {/* Background Image */}
                    <img
                        src={mocupUrl}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        alt="Background"
                    />

                    {/* Content Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'row',
                        padding: '250px 80px 140px 80px',
                    }}>
                        {/* Left Side - Photo & Info */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '50%',
                            paddingTop: '80px',
                        }}>
                            {/* Photo Circle */}
                            <div style={{
                                width: '380px',
                                height: '380px',
                                borderRadius: '50%',
                                border: '6px solid rgba(251, 191, 36, 0.9)',
                                boxShadow: '0 0 60px rgba(251, 191, 36, 0.5)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                        alt="Profile"
                                    />
                                ) : (
                                    <div style={{
                                        fontSize: '130px',
                                        color: '#fbbf24',
                                        display: 'flex',
                                    }}>
                                        👤
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div style={{
                                fontSize: '58px',
                                fontWeight: 800,
                                color: '#ffffff',
                                marginTop: '35px',
                                textAlign: 'center',
                                textShadow: '4px 4px 12px rgba(0,0,0,0.95)',
                                letterSpacing: '1.5px',
                                display: 'flex',
                            }}>
                                {name}
                            </div>

                            {/* Title */}
                            <div style={{
                                fontSize: '38px',
                                fontWeight: 700,
                                color: '#5eead4',
                                marginTop: '12px',
                                textAlign: 'center',
                                textShadow: '3px 3px 10px rgba(0,0,0,0.95)',
                                display: title ? 'flex' : 'none',
                            }}>
                                {title}
                            </div>

                            {/* Company */}
                            <div style={{
                                fontSize: '32px',
                                fontWeight: 600,
                                color: '#a7f3d0',
                                marginTop: '8px',
                                textAlign: 'center',
                                textShadow: '3px 3px 10px rgba(0,0,0,0.95)',
                                display: company ? 'flex' : 'none',
                            }}>
                                {company}
                            </div>
                        </div>

                        {/* Right Side - CTA */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width: '50%',
                            paddingLeft: '25px',
                        }}>
                            {/* Main CTA */}
                            <div style={{
                                fontSize: '44px',
                                fontWeight: 700,
                                color: '#ffffff',
                                lineHeight: '1.3',
                                marginBottom: '12px',
                                textShadow: '3px 3px 12px rgba(0,0,0,0.95)',
                                letterSpacing: '0.5px',
                                display: 'flex',
                            }}>
                                {"I'm attending"}
                            </div>
                            <div style={{
                                fontSize: '44px',
                                fontWeight: 700,
                                color: '#ffffff',
                                lineHeight: '1.3',
                                marginBottom: '12px',
                                textShadow: '3px 3px 12px rgba(0,0,0,0.95)',
                                letterSpacing: '0.5px',
                                display: 'flex',
                            }}>
                                Ramadan Majlis
                            </div>
                            <div style={{
                                fontSize: '54px',
                                fontWeight: 700,
                                color: '#fcd34d',
                                lineHeight: '1.2',
                                textShadow: '3px 3px 12px rgba(0,0,0,0.95)',
                                display: 'flex',
                            }}>
                                2026
                            </div>

                            {/* Sub CTA */}
                            <div style={{
                                fontSize: '22px',
                                fontWeight: 500,
                                color: '#f3f4f6',
                                marginTop: '35px',
                                lineHeight: '1.7',
                                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                                display: 'flex',
                            }}>
                                Join me at one of
                            </div>
                            <div style={{
                                fontSize: '22px',
                                fontWeight: 500,
                                color: '#f3f4f6',
                                lineHeight: '1.7',
                                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                                display: 'flex',
                            }}>
                                the most transformative
                            </div>
                            <div style={{
                                fontSize: '22px',
                                fontWeight: 500,
                                color: '#f3f4f6',
                                lineHeight: '1.7',
                                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                                display: 'flex',
                            }}>
                                Ramadan experiences in Egypt
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info Bar - Centered */}
                    <div style={{
                        position: 'absolute',
                        bottom: '50px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        {/* Location & Night - Centered */}
                        <div style={{
                            display: 'flex',
                            gap: '35px',
                        }}>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#a7f3d0',
                                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                                display: location ? 'flex' : 'none',
                            }}>
                                📍 {location}
                            </div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: '#5eead4',
                                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                                display: night ? 'flex' : 'none',
                            }}>
                                🌙 {night}
                            </div>
                        </div>

                        {/* Website - Centered */}
                        <div style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#fcd34d',
                            textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                            display: 'flex',
                        }}>
                            ramadanmajlis.nextacademyedu.com
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
        console.error('Social share image generation error:', error);
        return new Response(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}
