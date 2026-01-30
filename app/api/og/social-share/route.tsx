import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name') || 'A Guest';

        return new ImageResponse(
            (
                <div style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    background: 'linear-gradient(135deg, #064e3b 0%, #0a352a 50%, #022c22 100%)',
                    position: 'relative',
                    fontFamily: 'sans-serif',
                    padding: '80px',
                    boxSizing: 'border-box'
                }}>
                    {/* Decorative Moon */}
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        right: '40px',
                        fontSize: '120px',
                        opacity: 0.2
                    }}>
                        🌙
                    </div>

                    {/* Content */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'white',
                        width: '100%',
                        zIndex: 1
                    }}>
                        {/* Headline */}
                        <div style={{
                            fontSize: '56px',
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            color: '#ffffff'
                        }}>
                            {name} is attending
                        </div>

                        {/* Event Title */}
                        <div style={{
                            fontSize: '92px',
                            fontWeight: 'bold',
                            color: '#fbbf24',
                            marginBottom: '40px',
                            lineHeight: '1.1'
                        }}>
                            Ramadan Majlis 2026 🌙
                        </div>

                        {/* Description */}
                        <div style={{
                            fontSize: '32px',
                            lineHeight: '1.5',
                            marginBottom: '40px',
                            color: '#e5e7eb',
                            maxWidth: '900px'
                        }}>
                            Three transformative Thursday nights with 12 world-class experts,
                            strategic networking over premium Suhoor, and hands-on learning circles.
                        </div>

                        {/* Event Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            <div style={{
                                fontSize: '28px',
                                color: '#22d3ee',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                📍 New Cairo • Dokki • 6th October
                            </div>
                            <div style={{
                                fontSize: '28px',
                                color: '#22d3ee',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                🗓 Feb 26, Mar 5 & Mar 12, 2026
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{
                            marginTop: '40px',
                            fontSize: '24px',
                            color: '#fbbf24',
                            fontWeight: 'bold'
                        }}>
                            ramadanmajlis.nextacademyedu.com
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630
            }
        );
    } catch (error) {
        console.error('Social share image generation error:', error);
        return new Response('Failed to generate image', { status: 500 });
    }
}
