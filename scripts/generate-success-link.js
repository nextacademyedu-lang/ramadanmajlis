const crypto = require('crypto');

const secret = "A9BBBF2EBAE203AC2B7D94A8FF47386B"; // Your HMAC Secret

const params = {
    amount_cents: "100",
    created_at: new Date().toISOString(),
    currency: "EGP",
    error_occured: "false",
    has_parent_transaction: "false",
    id: "123456789", // Mock Transaction ID
    integration_id: "5465534", // Your Card Integration ID
    is_3d_secure: "true",
    is_auth: "false",
    is_capture: "false",
    is_refunded: "false",
    is_standalone_payment: "true",
    is_voided: "false",
    order: "987654321", // Mock Order ID
    owner: "2139430",
    pending: "false",
    "source_data.pan": "2346", // Mock Last 4 digits
    "source_data.sub_type": "MasterCard",
    "source_data.type": "card",
    success: "true"
};

const hmacKeys = [
    "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction",
    "id", "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded",
    "is_standalone_payment", "is_voided", "order", "owner", "pending", "source_data.pan",
    "source_data.sub_type", "source_data.type", "success"
];

const concatenatedValues = hmacKeys.sort().map(key => params[key]).join("");
const hmac = crypto.createHmac('sha512', secret)
    .update(concatenatedValues)
    .digest('hex');

const queryString = new URLSearchParams({ ...params, hmac }).toString();

console.log("\n✅ Generated Test URL (Localhost):");
console.log(`http://localhost:3000/payment-success?${queryString}`);

console.log("\n✅ Generated Test URL (Production - Verify Domain):");
console.log(`https://ramadanmajlis.nextacademyedu.com/payment-success?${queryString}`);
