-- 1. Grant usage on the schema (just to be safe)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 2. Grant SELECT permission on the tables to the 'anon' role
GRANT SELECT ON event_nights TO anon;
GRANT SELECT ON events TO anon;

-- 3. Ensure RLS is verified
ALTER TABLE event_nights ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply the Open Access Policies explicitly
DROP POLICY IF EXISTS "Public nights are viewable by everyone" ON event_nights;
CREATE POLICY "Public nights are viewable by everyone" ON event_nights
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public events are viewable" ON events;
CREATE POLICY "Public events are viewable" ON events
  FOR SELECT
  TO public
  USING (true);
