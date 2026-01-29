-- Create Industries Table
CREATE TABLE IF NOT EXISTS industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_code TEXT NOT NULL DEFAULT '#ffffff',
  zone_name TEXT DEFAULT 'General Area',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read industries (for dropdowns)
CREATE POLICY "Anyone can read industries" ON industries
  FOR SELECT TO anon
  USING (true);

-- Allow authenticated users (admins) to modify
-- (Assuming service_role or specific admin check later)
CREATE POLICY "Admins can modify industries" ON industries
  FOR ALL TO service_role
  USING (true);

-- Insert Default Data
INSERT INTO industries (name, color_code, zone_name) VALUES
('Technology & Development', '#10B981', 'Zone A'),     -- Emerald
('Marketing & Advertising', '#F59E0B', 'Zone B'),      -- Amber
('Sales & Business Development', '#3B82F6', 'Zone C'), -- Blue
('Design & Creative', '#EC4899', 'Zone D'),            -- Pink
('Product Management', '#8B5CF6', 'Zone A'),           -- Violet
('Finance & Accounting', '#64748B', 'Zone E'),         -- Slate
('HR & Recruitment', '#F43F5E', 'Zone E'),             -- Rose
('Operations & Logistics', '#06B6D4', 'Zone F'),       -- Cyan
('Legal', '#4B5563', 'Zone F'),                        -- Gray
('Healthcare', '#14B8A6', 'Zone G'),                   -- Teal
('Education', '#EAB308', 'Zone G'),                    -- Yellow
('Other', '#9CA3AF', 'General Area')                   -- Gray
ON CONFLICT (name) DO NOTHING;

-- Add industry_id key to bookings for future linking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS industry_id UUID REFERENCES industries(id);

-- Create Index
CREATE INDEX IF NOT EXISTS idx_bookings_industry_id ON bookings(industry_id);
