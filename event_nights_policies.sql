-- Enable RLS on event_nights and allow public read
ALTER TABLE event_nights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public nights are viewable by everyone" ON event_nights;

CREATE POLICY "Public nights are viewable by everyone"
ON event_nights FOR SELECT
USING (true);
