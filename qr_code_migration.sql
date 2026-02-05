-- Add QR Code and Check-in columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS qr_code text UNIQUE,
    ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;
-- Create an index for faster lookups by QR code
CREATE INDEX IF NOT EXISTS idx_bookings_qr_code ON bookings(qr_code);
-- Function to auto-generate QR code if not provided (optional, can be handled in code)
-- For now, we will handle generation in the application code (webhook).