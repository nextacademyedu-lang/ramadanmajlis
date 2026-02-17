-- Add columns to link promo codes to specific nights or package
ALTER TABLE promo_codes
ADD COLUMN IF NOT EXISTS target_nights TEXT [],
    -- Array of Night IDs or Titles to which this code applies
ADD COLUMN IF NOT EXISTS is_package_exclusive BOOLEAN DEFAULT false;
-- If true, only applies if booking is for the full package
-- Update Policies if needed (usually existing policies cover new columns if they are just SELECT/INSERT)
-- Ensure the validation API can read these columns (it uses service role, so yes)