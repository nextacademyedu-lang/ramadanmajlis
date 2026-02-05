-- Add agenda column to event_nights table
ALTER TABLE event_nights
ADD COLUMN IF NOT EXISTS agenda JSONB DEFAULT '[]'::jsonb;