import crypto from 'crypto';

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '1483542626454427';

// Hash user data (email, phone, etc.) using SHA256
const hashData = (data: string) => {
    if (!data) return null;
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

type EventName = 'InitiateCheckout' | 'Purchase' | 'PageView' | 'Lead' | 'CompleteRegistration';

interface UserData {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    clientIp?: string;
    userAgent?: string;
    fbp?: string;
    fbc?: string;
}

interface CustomData {
    currency?: string;
    value?: number;
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    order_id?: string;
    [key: string]: any;
}

export const sendFbEvent = async (
    eventName: EventName,
    userData: UserData,
    customData?: CustomData,
    eventId?: string,
    eventSourceUrl?: string
) => {
    if (!FACEBOOK_ACCESS_TOKEN) {
        console.warn('Facebook Access Token not found. Skipping CAPI event.');
        return;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const payload = {
        data: [
            {
                event_name: eventName,
                event_time: currentTimestamp,
                event_id: eventId,
                event_source_url: eventSourceUrl,
                action_source: 'website',
                user_data: {
                    em: hashData(userData.email || ''),
                    ph: hashData(userData.phone || ''),
                    fn: hashData(userData.firstName || ''),
                    ln: hashData(userData.lastName || ''),
                    client_ip_address: userData.clientIp,
                    client_user_agent: userData.userAgent,
                    fbp: userData.fbp,
                    fbc: userData.fbc,
                },
                custom_data: customData,
            },
        ],
    };

    try {
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('Facebook CAPI Error:', JSON.stringify(data.error, null, 2));
        } else {
            console.log(`Facebook CAPI Success used Token : ${FACEBOOK_ACCESS_TOKEN} - Event: ${eventName}, ID: ${eventId}`);
        }
    } catch (error) {
        console.error('Facebook CAPI Request Failed:', error);
    }
};
