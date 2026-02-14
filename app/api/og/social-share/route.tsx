import { ImageResponse } from '@vercel/og';
import { MOCUP_BASE64 } from './mocup-image';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = (searchParams.get('name') || 'Guest').trim();
        const title = (searchParams.get('title') || '').trim();
        const company = (searchParams.get('company') || '').trim();
        const night = (searchParams.get('night') || '').trim();
        const location = (searchParams.get('location') || '').trim();
        const photoUrl = (searchParams.get('photo') || '').trim();

        // Pre-fetch photo and convert to base64 data URL
        // This prevents @vercel/og from failing silently on external URLs
        let photoDataUrl = '';
        if (photoUrl) {
            try {
                const photoResponse = await fetch(photoUrl);
                if (photoResponse.ok) {
                    const photoBuffer = await photoResponse.arrayBuffer();
                    const bytes = new Uint8Array(photoBuffer);
                    let binary = '';
                    const chunkSize = 8192;
                    for (let i = 0; i < bytes.length; i += chunkSize) {
                        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
                    }
                    const base64 = btoa(binary);
                    const contentType = photoResponse.headers.get('content-type') || 'image/png';
                    photoDataUrl = `data:${contentType};base64,${base64}`;
                }
            } catch (e) {
                console.error('Failed to fetch profile photo:', e);
            }
        }

        // Use the embedded base64 image - safest and fastest method for serverless
        const mocupUrl = MOCUP_BASE64;
        // console.log('✅ Using embedded MOCUP_BASE64');

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
                                {photoDataUrl ? (
                                    <img
                                        src={photoDataUrl}
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
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        return new Response(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}
