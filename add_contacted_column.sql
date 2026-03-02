-- Add is_contacted column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_contacted BOOLEAN DEFAULT false;
