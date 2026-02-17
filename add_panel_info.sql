-- Add panel details to event_nights
ALTER TABLE event_nights
ADD COLUMN IF NOT EXISTS panel_title TEXT,
    ADD COLUMN IF NOT EXISTS panel_description TEXT;
-- Add topic to speakers
ALTER TABLE speakers
ADD COLUMN IF NOT EXISTS speaker_topic TEXT;