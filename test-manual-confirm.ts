import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
// Ensure API key is in process.env
const { confirmBooking } = require('./lib/booking-service.ts');

async function test() {
    try {
        console.log("Key available for manual test?", !!process.env.EVOLUTION_API_KEY);
        const result = await confirmBooking("338969eb-6e35-4efe-a282-0c0a1945e7a4");
        console.log("Manual confirm result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Test error:", e);
    }
}
test();
