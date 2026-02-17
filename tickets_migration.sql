-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    night_date TEXT NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    -- 'pending', 'checked_in'
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, night_date) -- Prevent duplicate tickets for same night
);
-- Index for faster QR lookups
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
-- Allow public read access (for admin scanner) - restrict this in prod if possible, but for now matching bookings policy
CREATE POLICY "Anyone can read tickets" ON tickets FOR
SELECT TO anon USING (true);