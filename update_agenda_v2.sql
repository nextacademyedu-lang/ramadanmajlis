-- Update Night 1: The Compass (Vision, Values & Brand) - Feb 28
-- Night ID: 5b85461d-656a-41fb-80db-71b34dfcebec
UPDATE event_nights
SET agenda = '[
  {"time": "21:00", "title": "Executive Coffee & Welcoming", "description": "Networking and warm welcome", "type": "networking"},
  {"time": "21:30", "title": "First Activity: The Expert Match", "description": "Coloring code activity", "type": "activity"},
  {"time": "22:00", "title": "First Talk: Strategic Visionary", "description": "Focuses on long-term business planning for 2026", "speaker": "Ahmed Bayoumi", "type": "talk"},
  {"time": "22:15", "title": "Second Talk: Brand Architect", "description": "Specialist in Personal Branding and corporate reputation", "speaker": "Dr. Hesham El Araky", "type": "talk"},
  {"time": "22:30", "title": "Second Activity", "description": "Networking session", "type": "networking"},
  {"time": "23:00", "title": "Third Talk: Purpose Coach", "description": "Expert in aligning career goals with life values", "speaker": "Ebrahem Anwar", "type": "talk"},
  {"time": "23:15", "title": "Fourth Talk: Spiritual Guide", "description": "Discusses the Philosophy of Intention in leadership", "speaker": "Heba Abdelrazek", "type": "talk"},
  {"time": "23:30", "title": "The Business Clinic Panel", "description": "Note collection and break", "type": "panel"},
  {"time": "00:30", "title": "Learning Circles: The Integrity Compass", "description": "Group discussions", "type": "workshop"},
  {"time": "01:30", "title": "Suhoor", "description": "Closing and Suhoor", "type": "break"}
]'::jsonb
WHERE id = '5b85461d-656a-41fb-80db-71b34dfcebec';
-- Update Speakers for Night 1
-- Note: Ahmed Bayoumi is missing in DB, inserting placeholder or assuming not in list. 
-- found: Heba abdelrazek (12f28c7b-abe6-4fcc-8053-8f43ed734f9b)
-- found: Ebrahem Anwar (b74a122d-c34d-4a56-a425-89c9830bc66b)
-- found: Hesham Alaraky (9b558815-37f9-4d0a-b85a-c9755fb8511b) - formatting name match
UPDATE speakers
SET speaker_topic = 'Strategic Visionary',
    display_order = 1
WHERE name ILIKE '%Ahmed Bayoumi%';
-- Might not exist
UPDATE speakers
SET speaker_topic = 'Brand Architect: Personal Branding & Reputation',
    display_order = 2
WHERE id = '9b558815-37f9-4d0a-b85a-c9755fb8511b';
-- Dr. Hesham
UPDATE speakers
SET speaker_topic = 'Purpose Coach: Aligning Career with Values',
    display_order = 3
WHERE id = 'b74a122d-c34d-4a56-a425-89c9830bc66b';
-- Ebrahem Anwar
UPDATE speakers
SET speaker_topic = 'Spiritual Guide: Philosophy of Intention',
    display_order = 4
WHERE id = '12f28c7b-abe6-4fcc-8053-8f43ed734f9b';
-- Heba Abdelrazek
-- Update Night 2: The Resilience (Growth, Finance & Well-being) - Mar 05
-- Night ID: 60d7091d-7e5f-41d0-bde3-d7299a174355
UPDATE event_nights
SET agenda = '[
  {"time": "21:00", "title": "Executive Coffee & Welcoming", "description": "Networking and warm welcome", "type": "networking"},
  {"time": "21:30", "title": "Activity", "description": "", "type": "activity"},
  {"time": "22:00", "title": "First Talk: Financial Consultant", "description": "Expert in cash flow management and inflation-proofing businesses", "speaker": "Hala Abdallah", "type": "talk"},
  {"time": "22:15", "title": "Second Talk: Operations Expert", "description": "Specialist in systems, AI, and scaling efficiently", "speaker": "Kareem Turky", "type": "talk"},
  {"time": "22:30", "title": "Networking", "description": "Networking session", "type": "networking"},
  {"time": "23:00", "title": "Third Talk: Executive Psychologist", "description": "Focuses on mental resilience and preventing burnout", "speaker": "Mohamed Shafi", "type": "talk"},
  {"time": "23:15", "title": "Fourth Talk: Resilience Mentor", "description": "An entrepreneur who successfully navigated a major business crisis", "speaker": "TBD", "type": "talk"},
  {"time": "23:30", "title": "Panel: From Manual to Magical", "description": "AI in Operation", "type": "panel"},
  {"time": "00:30", "title": "The 1-on-1 Speed Consults", "description": "Consultation sessions", "type": "workshop"},
  {"time": "01:30", "title": "Suhoor", "description": "Closing and Suhoor", "type": "break"}
]'::jsonb
WHERE id = '60d7091d-7e5f-41d0-bde3-d7299a174355';
-- Update Speakers for Night 2
-- found: Kareem Turky (d129e4a4-5b2b-49a4-bdae-b6a5647b548c)
-- found: Hala Abdallah (1c5c6693-546c-4706-8eee-fdd8dd5f6370)
-- found: Mohamed Elshafie (e3b6cddd-316b-4914-b2c3-2969f725b962) - assumes Mohamed Shafi in CSV
UPDATE speakers
SET speaker_topic = 'Financial Consultant: Cash Flow & Inflation Proofing',
    display_order = 1
WHERE id = '1c5c6693-546c-4706-8eee-fdd8dd5f6370';
-- Hala Abdallah
UPDATE speakers
SET speaker_topic = 'Operations Expert: Systems, AI & Scaling',
    display_order = 2
WHERE id = 'd129e4a4-5b2b-49a4-bdae-b6a5647b548c';
-- Kareem Turky
UPDATE speakers
SET speaker_topic = 'Executive Psychologist: Mental Resilience',
    display_order = 3
WHERE id = 'e3b6cddd-316b-4914-b2c3-2969f725b962';
-- Mohamed Elshafie
-- Update Night 3: The Legacy (Impact, Networking & Partnerships) - Mar 12
-- Night ID: 7f9f24d2-fb98-40d9-95e3-abfdaf1751d5
UPDATE event_nights
SET agenda = '[
  {"time": "21:00", "title": "Executive Coffee & Welcoming", "description": "Networking and warm welcome", "type": "networking"},
  {"time": "21:30", "title": "Activity: The Notes", "description": "", "type": "activity"},
  {"time": "22:00", "title": "First Talk: Angel Investor", "description": "Discusses what makes a business investable and sustainable", "speaker": "TBD (Startup Gate)", "type": "talk"},
  {"time": "22:15", "title": "Second Talk: Partnership Expert", "description": "Specialist in high-level networking and strategic alliances", "speaker": "Nadeem Barakat", "type": "talk"},
  {"time": "22:30", "title": "Networking", "description": "Networking session", "type": "networking"},
  {"time": "23:00", "title": "Third Talk: Growth Framework", "description": "Strategic growth insights", "speaker": "Eng. Salah Khalil", "type": "talk"},
  {"time": "23:15", "title": "Fourth Talk: Sustainability/CSR Expert", "description": "Focuses on building businesses that give back to the community", "speaker": "Abdullah Amer", "type": "talk"},
  {"time": "23:30", "title": "Panel: Legacy Builder", "description": "Building to Last", "type": "panel"},
  {"time": "00:30", "title": "Impact Auction", "description": "Networking activity", "type": "workshop"},
  {"time": "01:30", "title": "Suhoor", "description": "Closing and Suhoor", "type": "break"}
]'::jsonb
WHERE id = '7f9f24d2-fb98-40d9-95e3-abfdaf1751d5';
-- Update Speakers for Night 3
-- found: Nadeem Barakat (660d4f59-aa6b-4acf-ba20-25aec8a5f58b)
-- found: Salah Khalil (28222bbf-e1ec-4b21-bfcf-5c1177a1f2a0)
-- found: Abdullah Amer (a280d606-9b53-4ccb-a04e-01acb1e6d645) - assumed Amer
UPDATE speakers
SET speaker_topic = 'Partnership Expert: Strategic Alliances',
    display_order = 1
WHERE id = '660d4f59-aa6b-4acf-ba20-25aec8a5f58b';
-- Nadeem Barakat
UPDATE speakers
SET speaker_topic = 'Growth Framework',
    display_order = 2
WHERE id = '28222bbf-e1ec-4b21-bfcf-5c1177a1f2a0';
-- Salah Khalil
UPDATE speakers
SET speaker_topic = 'Sustainability/CSR Expert: Community Impact',
    display_order = 3
WHERE id = 'a280d606-9b53-4ccb-a04e-01acb1e6d645';
-- Abdullah Amer