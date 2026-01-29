-- Create the event_nights table
CREATE TABLE IF NOT EXISTS event_nights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price NUMERIC DEFAULT 500,
  currency TEXT DEFAULT 'EGP',
  is_active BOOLEAN DEFAULT true,
  capacity INTEGER DEFAULT 100,
  color_theme TEXT DEFAULT 'emerald', -- emerald, blue, amber
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_nights ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Drop first to avoid errors on re-run)
DROP POLICY IF EXISTS "Public nights are viewable by everyone" ON event_nights;
CREATE POLICY "Public nights are viewable by everyone" ON event_nights
  FOR SELECT USING (true);

-- Seed data for Ramadan Nights 2026
INSERT INTO event_nights (date, title, subtitle, description, price, color_theme, capacity)
VALUES
  ('2026-03-20', 'The Compass', 'Vision, Values & Brand', 'A night to rediscover your internal compass. How to build a personal brand that reflects your true values?', 1999, 'blue', 100),
  ('2026-03-21', 'The Resilience', 'Growth, Finance & Well-being', 'In a world full of challenges, resilience is key. We discuss personal financial growth strategies.', 1999, 'emerald', 100),
  ('2026-03-22', 'The Legacy', 'Impact, Networking & Partnerships', 'True success is what you leave for others. How to build a strong network and create strategic partnerships?', 1999, 'amber', 100)
ON CONFLICT (date) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  color_theme = EXCLUDED.color_theme;

-- Events Table for Global Settings (Package Price)
DROP TABLE IF EXISTS events;
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  package_price NUMERIC DEFAULT 4999,
  currency TEXT DEFAULT 'EGP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public events are viewable" ON events;
CREATE POLICY "Public events are viewable" ON events FOR SELECT USING (true);

-- Seed Event Data
INSERT INTO events (slug, name, package_price)
VALUES ('ramadan-nights-2026', 'Ramadan Majlis 2026', 4999)
ON CONFLICT (slug) DO UPDATE SET
  package_price = EXCLUDED.package_price;
