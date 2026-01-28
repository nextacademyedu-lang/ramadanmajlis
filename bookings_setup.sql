-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  linkedin_url TEXT,
  industry TEXT,
  selected_nights TEXT[] NOT NULL,
  ticket_count INTEGER DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  payment_provider TEXT NOT NULL, -- 'paymob' or 'easykash' (case sensitive)
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant Permissions
GRANT ALL ON bookings TO anon;
GRANT ALL ON bookings TO service_role;

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can insert bookings" ON bookings;
CREATE POLICY "Anyone can insert bookings" ON bookings FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read bookings" ON bookings;
CREATE POLICY "Anyone can read bookings" ON bookings FOR SELECT TO anon USING (true);
