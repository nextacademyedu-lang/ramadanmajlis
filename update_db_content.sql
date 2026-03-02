-- Update Package Price in 'events' table
UPDATE events 
SET package_price = 4999 
WHERE slug = 'ramadan-nights-2026';

-- Update Night 1
UPDATE event_nights 
SET 
    title = 'The Compass',
    subtitle = 'Vision, Values & Brand',
    description = 'Aligning professional success with spiritual purpose and personal identity.',
    date = '2026-02-26',
    location = 'Tolip Hotel – New Cairo',
    price = 1999,
    capacity = 100,
    color_theme = 'emerald'
WHERE id = 1; -- Assuming ID 1 is the first night, adjust if IDs are different

-- Update Night 2
UPDATE event_nights 
SET 
    title = 'The Resilience',
    subtitle = 'Growth, Finance & Well-being',
    description = 'Navigating market volatility while maintaining mental and financial health.',
    date = '2026-03-05',
    location = 'Hyatt Regency, 6th of October',
    price = 1999,
    capacity = 100,
    color_theme = 'blue'
WHERE id = 2;

-- Update Night 3
UPDATE event_nights 
SET 
    title = 'The Legacy',
    subtitle = 'Networking & Partnerships',
    description = 'Moving from individual success to collective influence and long-term impact.',
    date = '2026-03-12',
    location = 'Pyramisa Suites Hotel, Dokki',
    price = 1999,
    capacity = 100,
    color_theme = 'amber'
WHERE id = 3;
