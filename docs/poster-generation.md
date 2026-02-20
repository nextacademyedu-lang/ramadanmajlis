# Poster / OG Image Generation with Next.js

دليل شامل لعمل بوستر (صورة) مخصص لكل عميل بعد الحجز باستخدام `@vercel/og` مع Next.js.

---

## الفكرة

بعد ما العميل يحجز ويدفع، بيتعرض عليه **بوستر شخصي** فيه اسمه وصورته وبيانات الحدث. العميل يقدر:
1. **يحملها** كصورة PNG
2. **يشاركها** على السوشيال ميديا (LinkedIn, Facebook, Twitter, WhatsApp)
3. **تتبعتله** على WhatsApp تلقائياً

---

## 1. المتطلبات

```bash
npm install @vercel/og
```

---

## 2. إنشاء OG Image Route (Edge Function)

### الملف: `app/api/og/social-share/route.tsx`

```tsx
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';  // ⚠️ لازم يكون Edge

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = (searchParams.get('name') || 'Guest').trim();
        const title = (searchParams.get('title') || '').trim();
        const company = (searchParams.get('company') || '').trim();
        const photoUrl = (searchParams.get('photo') || '').trim();

        // صورة الخلفية (لازم تكون URL كامل)
        const backgroundUrl = 'https://yourdomain.com/poster-background.png';

        return new ImageResponse(
            (
                <div style={{
                    width: '1200px',
                    height: '1200px',
                    display: 'flex',
                    position: 'relative',
                    fontFamily: 'system-ui, sans-serif',
                }}>
                    {/* صورة الخلفية */}
                    <img
                        src={backgroundUrl}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                        }}
                        alt="Background"
                    />

                    {/* المحتوى */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px',
                    }}>
                        {/* صورة العميل (دائرية) */}
                        <div style={{
                            width: '380px', height: '380px',
                            borderRadius: '50%',
                            border: '6px solid rgba(251, 191, 36, 0.9)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}>
                            {photoUrl ? (
                                <img src={photoUrl}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    alt="Profile"
                                />
                            ) : (
                                <div style={{ fontSize: '130px', display: 'flex' }}>👤</div>
                            )}
                        </div>

                        {/* الاسم */}
                        <div style={{
                            fontSize: '58px', fontWeight: 800,
                            color: '#ffffff', marginTop: '35px',
                            textShadow: '4px 4px 12px rgba(0,0,0,0.95)',
                            display: 'flex',
                        }}>
                            {name}
                        </div>

                        {/* المسمى الوظيفي */}
                        {title && (
                            <div style={{
                                fontSize: '38px', fontWeight: 700,
                                color: '#5eead4', marginTop: '12px',
                                display: 'flex',
                            }}>
                                {title}
                            </div>
                        )}

                        {/* الشركة */}
                        {company && (
                            <div style={{
                                fontSize: '32px', fontWeight: 600,
                                color: '#a7f3d0', marginTop: '8px',
                                display: 'flex',
                            }}>
                                {company}
                            </div>
                        )}
                    </div>
                </div>
            ),
            { width: 1200, height: 1200 }
        );
    } catch (error) {
        return new Response('Failed to generate image', { status: 500 });
    }
}
```

> [!IMPORTANT]
> **قيود `@vercel/og`:**
> - لازم يكون `runtime = 'edge'`
> - ما يدعمش كل CSS - فقط inline styles
> - كل عنصر محتاج `display: 'flex'` صراحةً
> - الصور لازم تكون URL كامل (مش relative)
> - لو استخدمت `display: none` استبدله بـ `display: title ? 'flex' : 'none'`
> - لو عندك نصوص عربية، ممكن تحتاج تحمل خط يدعم العربية

---

## 3. عرض البوستر في صفحة النجاح

### الملف: `app/payment-success/PaymentSuccessClient.tsx`

```tsx
"use client";
import { useMemo, useState } from "react";

export default function PaymentSuccessClient() {
    const [imageLoading, setImageLoading] = useState(true);

    // بناء رابط البوستر من بيانات العميل
    const posterUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set('name', localStorage.getItem('booking_name') || 'Guest');
        params.set('title', localStorage.getItem('booking_title') || '');
        params.set('company', localStorage.getItem('booking_company') || '');
        params.set('photo', localStorage.getItem('booking_photo') || '');
        return `/api/og/social-share?${params.toString()}`;
    }, []);

    // تحميل البوستر كصورة
    const handleDownload = async () => {
        const response = await fetch(posterUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-poster.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div>
            {/* عرض البوستر */}
            <div style={{ position: 'relative', aspectRatio: '1/1' }}>
                {imageLoading && <div>Loading...</div>}
                <img
                    src={posterUrl}
                    alt="Your Poster"
                    onLoad={() => setImageLoading(false)}
                    style={{ width: '100%' }}
                />
            </div>

            {/* زر التحميل */}
            <button onClick={handleDownload}>
                Download Poster
            </button>

            {/* أزرار المشاركة */}
            <button onClick={() => {
                window.open(`https://wa.me/?text=${encodeURIComponent('Check out my poster!')}`, '_blank');
            }}>
                Share on WhatsApp
            </button>
        </div>
    );
}
```

---

## 4. إرسال البوستر عبر WhatsApp (اختياري)

### باستخدام Evolution API

```typescript
// app/api/send-poster/route.ts
import { NextResponse } from 'next/server';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

// تنسيق رقم الهاتف (مصري: 201xxxxxxxxx بدون +)
function formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '20' + cleaned.substring(1);
    }
    return cleaned;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    // 1. اجلب بيانات الحجز من قاعدة البيانات
    // 2. ابني رابط البوستر
    const params = new URLSearchParams({
        name: booking.customer_name,
        title: booking.job_title,
        company: booking.company,
        photo: booking.profile_image_url || ''
    });
    const imageUrl = `https://yourdomain.com/api/og/social-share?${params.toString()}`;

    // 3. ابعت البوستر عبر WhatsApp
    await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY!
        },
        body: JSON.stringify({
            number: formatPhoneNumber(booking.phone),
            mediatype: 'image',
            media: imageUrl,
            caption: `مرحباً ${booking.customer_name}! هذا هو بوستر حضورك 🎉`
        })
    });

    return NextResponse.json({ success: true });
}
```

---

## 5. صورة الخلفية (Mockup)

- ارفع صورة الخلفية في **`public/poster-background.png`**
- الحجم المثالي: **1200×1200 بكسل**
- في الكود استخدم الـ URL الكامل: `https://yourdomain.com/poster-background.png`

---

## 6. الملفات المطلوبة (ملخص)

```
app/
├── api/
│   ├── og/
│   │   └── social-share/
│   │       └── route.tsx          ← إنشاء الصورة (Edge Function)
│   └── send-poster/
│       └── route.ts               ← إرسال البوستر عبر WhatsApp
├── payment-success/
│   ├── page.tsx                   ← صفحة النجاح (Server Component)
│   └── PaymentSuccessClient.tsx   ← عرض البوستر والمشاركة (Client Component)
public/
└── poster-background.png          ← صورة الخلفية
```

---

## ⚠️ نصائح مهمة

1. **الصور في OG**: لازم تكون URLs كاملة (مش relative paths). Edge Functions مش بتعرف تقرأ ملفات محلية.
2. **حجم الصورة**: `1200×1200` هو الأفضل للسوشيال ميديا (مربع).
3. **الأداء**: الـ OG image بيتولد في كل طلب. لو عندك ترافيك عالي، فكر في caching.
4. **الخطوط**: `@vercel/og` بيدعم خطوط مخصصة لكن لازم تحملها كـ ArrayBuffer.
5. **صورة العميل**: لازم تكون URL عام (مش صورة محلية). استخدم Supabase Storage أو Cloudinary.
