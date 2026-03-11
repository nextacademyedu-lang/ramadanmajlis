-- ============================================
-- Add Compass Panel Speakers — Night 1 (The Compass, Feb 28)
-- Night ID: 5b85461d-656a-41fb-80db-71b34dfcebec
-- ============================================

-- 1. Insert Sara El Awdan
INSERT INTO speakers (name, title, image_url, night_id, role, panel_key, speaker_topic, display_order)
VALUES (
  'Sara El Awdan',
  'Marketing Director | BasharSoft | WUZZUF | FORASNA',
  '/speakers/Sara El Awdan.jpg',
  '5b85461d-656a-41fb-80db-71b34dfcebec',
  'Panel Speaker',
  'compass_panel',
  NULL,
  50
);

-- 2. Insert Mahmoud Hegab
INSERT INTO speakers (name, title, image_url, night_id, role, panel_key, speaker_topic, display_order)
VALUES (
  'Mahmoud Hegab',
  'Co-Founder & CEO @ Makkook.AI | Enterprise AI Solutions Architect',
  '/speakers/Mahmoud Hegab.jpg',
  '5b85461d-656a-41fb-80db-71b34dfcebec',
  'Panel Speaker',
  'compass_panel',
  NULL,
  51
);

-- 3. Update Night 1 agenda — add panel_key to "The Business Clinic Panel"
UPDATE event_nights
SET agenda = (
  SELECT jsonb_agg(
    CASE
      WHEN item->>'title' = 'The Business Clinic Panel'
      THEN item || '{"panel_key": "compass_panel"}'::jsonb
      ELSE item
    END
  )
  FROM jsonb_array_elements(agenda) AS item
)
WHERE id = '5b85461d-656a-41fb-80db-71b34dfcebec';

-- Verify
SELECT name, title, role, panel_key FROM speakers WHERE panel_key = 'compass_panel';
