export interface Event {
    id: string;
    name: string;
    dates: string[]; // Stored as JSONB ["YYYY-MM-DD", ...]
    base_price: number;
}

export interface Booking {
    id: string;
    customer_name: string;
    email: string;
    phone: string;
    job_title: string;
    company?: string; // New
    linkedin_url?: string; // New
    industry: string;
    selected_nights: string[];
    ticket_count: number;
    total_amount: number;
    payment_provider: 'paymob';
    payment_status: 'pending' | 'paid';
    status: 'pending' | 'confirmed' | 'cancelled';
    profile_image_url?: string; // New
    generated_card_url?: string; // New
    share_token?: string; // New
    qr_code?: string; // New: Unique code for check-in
    checked_in_at?: string; // New: Timestamp of check-in
    created_at?: string;
}

export interface EventNight {
    id: string;
    date: string;
    title: string;
    subtitle?: string;
    description?: string;
    price: number;
    currency: string;
    is_active: boolean;
    capacity: number;
    color_theme: 'emerald' | 'blue' | 'amber' | string;
}

export const INDUSTRIES = [
    "Technology & Development",
    "Marketing & Advertising",
    "Sales & Business Development",
    "Design & Creative",
    "Product Management",
    "Finance & Accounting",
    "HR & Recruitment",
    "Operations & Logistics",
    "Legal",
    "Healthcare",
    "Education",
    "Other"
] as const;

declare global {
    interface Window {
        fbq: any;
    }
}
