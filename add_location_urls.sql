-- Add location_url column to event_nights
ALTER TABLE event_nights
ADD COLUMN IF NOT EXISTS location_url TEXT;
-- Update Night 1: Feb 28
UPDATE event_nights
SET location_url = 'https://maps.app.goo.gl/rrnWo2FYQ7iD9yW16'
WHERE id = '5b85461d-656a-41fb-80db-71b34dfcebec';
-- Update Night 2: Mar 05
UPDATE event_nights
SET location_url = 'https://maps.app.goo.gl/D5ARcNFi8953w7AV9'
WHERE id = '60d7091d-7e5f-41d0-bde3-d7299a174355';
-- Update Night 3: Mar 12
UPDATE event_nights
SET location_url = 'https://maps.app.goo.gl/aU81FrqETdqqM7Mh8'
WHERE id = '7f9f24d2-fb98-40d9-95e3-abfdaf1751d5';