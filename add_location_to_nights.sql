-- Add location column if it doesn't exist
ALTER TABLE event_nights ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Creativa Innovation Hub';

-- Update specific nights with their locations (Example placeholders, User can update these in DB)
UPDATE event_nights SET location = 'Semiramis InterContinental' WHERE date = '2026-03-20'; -- Night 1
UPDATE event_nights SET location = 'Nile Ritz-Carlton' WHERE date = '2026-03-21';      -- Night 2
UPDATE event_nights SET location = 'Four Seasons Nile Plaza' WHERE date = '2026-03-22';-- Night 3
