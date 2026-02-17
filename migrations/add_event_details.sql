-- Add new columns for dynamic event details
ALTER TABLE events
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS location_name TEXT,
    ADD COLUMN IF NOT EXISTS location_url TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS subtitle TEXT;
-- Update the main event with correct data
UPDATE events
SET start_date = '2026-03-20 00:00:00+00',
    end_date = '2026-03-25 00:00:00+00',
    location_name = 'Creativa Innovation Hub, Giza',
    location_url = 'https://maps.app.goo.gl/example',
    -- Placeholder, update if real URL known
    description = 'Join us for an exceptional experience combining the spirituality of the Holy Month with the ambition of future leaders and Networking in a luxurious atmosphere worthy of you.',
    subtitle = 'For Entrepreneurs'
WHERE slug = 'ramadan-nights-2026';