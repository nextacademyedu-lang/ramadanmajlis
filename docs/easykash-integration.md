# EasyKash Payment Integration with Next.js (الدليل الشامل والمفصل)

دليل شامل لربط بوابة الدفع EasyKash مع مشروع Next.js، مع حلول للمشاكل الشائعة.

---

## أولاً: المتطلبات الأساسية

| المتطلب | الوصف | ملاحظات |
|---------|-------|---------|
| **EasyKash Account** | حساب تاجر (Business Account) | تأكد إنه "Active" ومش "Pending" |
| **DirectPay** | تفعيل خدمة الدفع المباشر | لازم تطلب تفعيلها من الدعم الفني لو مش شغالة |
| **API Token** | مفتاح الربط (Access Token) | من داشبورد EasyKash (Settings → API Keys) |
| **HMAC Secret** | مفتاح التشفير للـ Webhook | لضمان أمان الإشعارات |

---

## ثانياً: إعدادات المشروع (Environment Variables)

أضف المتغيرات التالية في ملف `.env.local`:

```env
# .env.local
EASYKASH_API_TOKEN=your_generated_token_here
EASYKASH_HMAC_SECRET=your_hmac_secret_here
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

> [!IMPORTANT]
> **تنبيه:** تأكد إن ` NEXT_PUBLIC_BASE_URL` يشير لرابط الموقع الفعلي (Production URL) عند الرفع، عشان الـ Redirect يشتغل صح.

---

## ثالثاً: خطوات الربط (Code Integration)

### 1. إنشاء عملية الدفع (Payment Initiation)

**الملف:** `app/api/create-booking/route.ts`

**الوظيفة:** استلام بيانات الحجز وإرسالها لـ EasyKash للحصول على رابط الدفع.

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, amount, customer, provider } = body;

        // 1. التحقق من البيانات الأساسية
        if (!bookingId || !amount || !customer || !provider) {
            // خطأ شائع: نسيان إرسال أحد الحقول يسبب 500 Error
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const easyKashToken = process.env.EASYKASH_API_TOKEN;
        if (!easyKashToken) {
            throw new Error("Payment configuration error: Missing Token");
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const redirectUrl = `${baseUrl}/payment-success?bookingId=${bookingId}`;

        // 2. تنظيف وتنسيق رقم الهاتف (مهم جداً للمحفظة)
        // EasyKash بتقبل الصيغة المصرية: 01xxxxxxxxx (11 رقم، تبدأ بـ 01)
        const rawPhone = customer.phone || '01000000000';
        let normalizedPhone = rawPhone.replace(/\D/g, ''); // إزالة أي رموز غير الأرقام
        if (normalizedPhone.startsWith('20')) {
            normalizedPhone = '0' + normalizedPhone.substring(2);
        } else if (!normalizedPhone.startsWith('0')) {
            normalizedPhone = '0' + normalizedPhone;
        }
        // قص الرقم ليكون 11 خانة فقط
        if (normalizedPhone.length > 11) {
            normalizedPhone = normalizedPhone.substring(0, 11);
        }

        // 3. تبسيط معرف الحجز (Customer Reference)
        // EasyKash أحياناً بترفض الرموز الخاصة، الأفضل إزالة الفواصل من UUID
        // مثال: "a1b2-c3d4" -> "a1b2c3d4"
        const simplifiedRef = bookingId.replace(/-/g, '');

        const payload = {
            amount: amount,             // المبلغ بالجنيه (مثلاً 100 لـ 100 جنيه)
            currency: "EGP",
            paymentOptions: [2, 3, 4, 5, 6],  // 2=Visa, 3=MasterCard, 4=Meeza, 5=Wallet, 6=ValU
            cashExpiry: 24,             // مهلة الدفع بالساعات
            name: `${customer.first_name} ${customer.last_name}`.trim(),
            email: customer.email,
            mobile: normalizedPhone,    // لازم يكون متنسق صح
            redirectUrl: redirectUrl,   // الرابط اللي هيرجعله العميل بعد الدفع
            customerReference: simplifiedRef // المعرف الفريد (ممنوع التكرار)
        };

        console.log('[EasyKash] Sending Payload:', JSON.stringify(payload)); // للتشخيص (Debugging)

        const response = await fetch('https://back.easykash.net/api/directpayv1/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': easyKashToken
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.redirectUrl) {
            return NextResponse.json({ paymentUrl: data.redirectUrl });
        } else {
            console.error('[EasyKash] Error:', data);
            throw new Error(`Payment Failed: ${data.message || JSON.stringify(data)}`);
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
```

---

### 2. التحقق من الدفع (Payment Verification)

**الملف:** `app/payment-success/page.tsx`

**الوظيفة:** عندما يعود العميل من صفحة الدفع، نقوم بسؤال EasyKash: "هل هذا العميل دفع فعلاً؟".

```typescript
// ... (داخل دالة الصفحة)
const easyKashToken = process.env.EASYKASH_API_TOKEN;

// ⚠️ خطأ شائع: استخدام ID مختلف في التحقق
// لازم تستخدم نفس الـ simplifiedRef اللي بعته في الأول
const response = await fetch('https://back.easykash.net/api/cash-api/inquire', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'authorization': easyKashToken
    },
    body: JSON.stringify({
        customerReference: bookingId.replace(/-/g, '') // إزالة الفواصل مرة أخرى
    })
});

const transaction = await response.json();
const isPaid = transaction.status === 'PAID' || transaction.status === 'SUCCESS';
```

---

## رابعاً: المشاكل الشائعة والحلول (Troubleshooting)

هذا القسم يحتوي على أهم المشاكل التي قد تواجهها وكيفية حلها.

### 1. مشكلة الدفع بالمحفظة (Wallet Error)
**الخطأ:** عند اختيار العميل "محفظة إلكترونية"، تظهر شاشة بيضاء أو خطأ في الـ Console:
`TypeError: Cannot read properties of undefined (reading 'id')`
أو الـ API يرجع `401 Unauthorized` على `/api/getTokenBusiness`.

**السبب:**
هذا الخطأ يعني أن **التوكن (API Token) الخاص بك غير صالح** أو ناقص الصلاحيات، أو أن حساب التاجر (Merchant Account) غير مفعل بشكل كامل لاستقبال مدفوعات المحفظة. EasyKash بتحاول تجيب بيانات التاجر باستخدام التوكن وبتفشل، فبالتالي الـ Frontend بتاعهم بيضرب (Crashes).

**الحل:**
1. اذهب لداشبورد EasyKash وتأكد أن حالة الحساب **Active**.
2. قم بتوليد **Token جديد** (Regenerate API Token) من الإعدادات.
3. انسخ التوكن الجديد وضعه في `.env.local`.
4. إذا استمرت المشكلة، تواصل مع دعم EasyKash لتفعيل "Wallet Payments" على حسابك.

---

### 2. خطأ تكرار المعرف (Duplicate Reference)
**الرسالة:** `Error: the 'customerReference' is already used!`

**السبب:**
حاولت إنشاء عملية دفع جديدة بنفس الـ `customerReference` لعملية سابقة. EasyKash تمنع تكرار هذا الحقل.

**الحل:**
1. تأكد أن كل حجز جديد يحصل على `UUID` جديد.
2. لو بتجرب (Testing)، لا تستخدم نفس الـ ID مرتين.
3. في الكود، تأكد إنك بتولد `bookingId` جديد لكل محاولة دفع.

---

### 3. خطأ تنسيق رقم الهاتف (Phone Number Format)
**المشكلة:** زر الدفع لا يعمل، أو الـ API يرفض الطلب.

**السبب:**
EasyKash تتطلب رقم الهاتف بصيغة مصرية محددة: `01xxxxxxxxx` (11 رقم).
- خطأ: `+2010...`
- خطأ: `2010...`
- صح: `010...`

**الحل:**
استخدم دالة التنسيق (Normalization) الموجودة في الكود أعلاه، التي تحول أي صيغة (مثل `+20` أو `20`) إلى الصيغة المطلوبة `01...`.

---

### 4. فشل التحقق (Verification Failed) رغم الخصم
**المشكلة:** العميل دفع وتم الخصم، لكن الموقع يقول "فشل الدفع".

**السبب:**
عدم تطابق `customerReference` بين مرحلة الإنشاء (Initiation) ومرحلة التحقق (Verification).
- أرسلت في الإنشاء: `aabbcc` (بدون فواصل).
- بحثت في التحقق عن: `aa-bb-cc` (بفواصل).
- EasyKash هتقولك "مش لاقية الحجز ده".

**الحل:**
وحد طريقة التعامل مع الـ ID. نوصي دائماً بإزالة الفواصل (`.replace(/-/g, '')`) في **كل المراحل** (الإنشاء، التحقق، والويب هوك).

---

### 5. Webhook لا يعمل
**المشكلة:** لا تصل إشعارات عند الدفع.

**الحل:**
1. تأكد أنك وضعت الـ `Callback URL` في داشبورد EasyKash.
2. تأكد أن الرابط `https` (وليس `http`) ومتاح من الإنترنت (مش `localhost`).
3. تأكد أنك تستخدم `EASYKASH_HMAC_SECRET` الصحيح للتحقق من التوقيع (Signature).

---

## روابط مفيدة

- [EasyKash Dashboard](https://dashboard.easykash.net/)
- [EasyKash API Docs](https://documenter.getpostman.com/view/13768393/TzJoDiQ8)

---

## المساعدة والدعم

لأي استفسار بخصوص الربط، يرجى التواصل مع:

**Muhammed Mekky**
- Phone/WhatsApp: `201098620547`
- Email: `contact@muhammedmekky.com`
