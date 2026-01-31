import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const name = searchParams.get('name') || 'Guest';
        const title = searchParams.get('title') || '';
        const company = searchParams.get('company') || '';
        const night = searchParams.get('night') || '';
        const location = searchParams.get('location') || '';
        const photo = searchParams.get('photo') || '';

        // Use the mocup image from public folder via URL
        const mocupUrl = `${origin}/mocup1.png`;

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
                                width: '320px',
                                height: '320px',
                                borderRadius: '50%',
                                border: '5px solid rgba(251, 191, 36, 0.9)',
                                boxShadow: '0 0 50px rgba(251, 191, 36, 0.4)',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            }}>
                                {photo ? (
                                    <img
                                        src={photo}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
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
                                fontSize: '48px',
                                fontWeight: 700,
                                color: '#ffffff',
                                marginTop: '30px',
                                textAlign: 'center',
                                textShadow: '3px 3px 10px rgba(0,0,0,0.9)',
                                letterSpacing: '1px',
                                display: 'flex',
                            }}>
                                {name}
                            </div>

                            {/* Title */}
                            <div style={{
                                fontSize: '28px',
                                fontWeight: 600,
                                color: '#5eead4',
                                marginTop: '10px',
                                textAlign: 'center',
                                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
                                display: title ? 'flex' : 'none',
                            }}>
                                {title}
                            </div>

                            {/* Company */}
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 500,
                                color: '#a7f3d0',
                                marginTop: '6px',
                                textAlign: 'center',
                                textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
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
        return new Response('Failed to generate image', { status: 500 });
    }
}
