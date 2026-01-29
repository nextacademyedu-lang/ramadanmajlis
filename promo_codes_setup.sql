-- Create Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  sales_agent TEXT NOT NULL, -- Name of the sales person
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- NULL means unlimited
  usage_count INTEGER DEFAULT 0,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Promo Columns to Bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES promo_codes(id),
ADD COLUMN IF NOT EXISTS discount_applied NUMERIC DEFAULT 0;

-- RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read promo codes (needed for validation)
-- In production, might want to restrict this to a specific RPC function to avoid listing all codes
CREATE POLICY "Anyone can read active promo codes" ON promo_codes
  FOR SELECT TO anon
  USING (is_active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_agent ON promo_codes(sales_agent);
