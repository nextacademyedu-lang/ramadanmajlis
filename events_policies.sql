-- Enable RLS on events and allow public read
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;

CREATE POLICY "Public events are viewable by everyone"
ON events FOR SELECT
USING (true);
