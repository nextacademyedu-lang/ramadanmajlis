-- Add role column to speakers table
ALTER TABLE speakers
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Keynote Speaker';
-- Update existing speakers to have 'Keynote Speaker' role (optional if default handles it, but good for clarity)
UPDATE speakers
SET role = 'Keynote Speaker'
WHERE role IS NULL;