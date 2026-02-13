-- Update Night 1: The Compass (Vision, Values & Brand) - Feb 28
-- Night ID: 5b85461d-656a-41fb-80db-71b34dfcebec
UPDATE event_nights
SET agenda = '[
  {"time": "21:00", "end_time": "21:30", "title": "Executive Coffee & Welcoming", "description": "Networking and warm welcome", "type": "networking"},
  {"time": "21:30", "end_time": "22:00", "title": "First Activity: The Expert Match", "description": "Coloring code activity", "type": "activity"},
  {"time": "22:00", "end_time": "22:15", "title": "First Talk: Strategic Visionary", "description": "Focuses on long-term business planning for 2026", "speaker_id": "88edd19e-9cca-4498-874e-04d2adf81da8", "type": "talk"},
  {"time": "22:15", "end_time": "22:30", "title": "Second Talk: Brand Architect", "description": "Specialist in Personal Branding and corporate reputation", "speaker_id": "9b558815-37f9-4d0a-b85a-c9755fb8511b", "type": "talk"},
  {"time": "22:30", "end_time": "23:00", "title": "Second Activity", "description": "Networking session", "type": "networking"},
  {"time": "23:00", "end_time": "23:15", "title": "Third Talk: Purpose Coach", "description": "Expert in aligning career goals with life values", "speaker_id": "b74a122d-c34d-4a56-a425-89c9830bc66b", "type": "talk"},
  {"time": "23:15", "end_time": "23:30", "title": "Fourth Talk: Spiritual Guide", "description": "Discusses the Philosophy of Intention in leadership", "speaker_id": "12f28c7b-abe6-4fcc-8053-8f43ed734f9b", "type": "talk"},
  {"time": "23:30", "end_time": "00:30", "title": "The Business Clinic Panel", "description": "Note collection and break", "type": "panel"},
  {"time": "00:30", "end_time": "01:30", "title": "Learning Circles: The Integrity Compass", "description": "Group discussions", "type": "workshop"},
  {"time": "01:30", "end_time": "02:30", "title": "Suhoor", "description": "Closing and Suhoor", "type": "break"}
]'::jsonb
WHERE id = '5b85461d-656a-41fb-80db-71b34dfcebec';
-- Update Night 2: The Resilience (Growth, Finance & Well-being) - Mar 05
-- Night ID: 60d7091d-7e5f-41d0-bde3-d7299a174355
UPDATE event_nights
SET agenda = '[
  {"time": "21:00", "end_time": "21:30", "title": "Executive Coffee & Welcoming", "description": "Networking and warm welcome", "type": "networking"},
  {"time": "21:30", "end_time": "22:00", "title": "Activity", "description": "", "type": "activity"},
  {"time": "22:00", "end_time": "22:15", "title": "First Talk: Financial Consultant", "description": "Expert in cash flow management and inflation-proofing businesses", "speaker_id": "1c5c6693-546c-4706-8eee-fdd8dd5f6370", "type": "talk"},
  {"time": "22:15", "end_time": "22:30", "title": "Second Talk: Operations Expert", "description": "Specialist in systems, AI, and scaling efficiently", "speaker_id": "d129e4a4-5b2b-49a4-bdae-b6a5647b548c", "type": "talk"},
  {"time": "22:30", "end_time": "23:00", "title": "Networking", "description": "Networking session", "type": "networking"},
  {"time": "23:00", "end_time": "23:15", "title": "Third Talk: Executive Psychologist", "description": "Focuses on mental resilience and preventing burnout", "speaker_id": "e3b6cddd-316b-4914-b2c3-2969f725b962", "type": "talk"},
  {"time": "23:15", "end_time": "23:30", "title": "Fourth Talk: Resilience Mentor", "description": "An entrepreneur who successfully navigated a major business crisis", "type": "talk"},
  {"time": "23:30", "end_time": "00:30", "title": "Panel: From Manual to Magical", "description": "AI in Operation", "type": "panel"},
  {"time": "00:30", "end_time": "01:30", "title": "The 1-on-1 Speed Consults", "description": "Consultation sessions", "type": "workshop"},
  {"time": "01:30", "end_time": "02:30", "title": "Suhoor", "description": "Closing and Suhoor", "type": "break"}
]'::jsonb
WHERE id = '60d7091d-7e5f-41d0-bde3-d7299a174355';
-- Update Night 3: The Legacy (Impact, Networking & Partnerships) - Mar 12
-- Night ID: 7f9f24d2-fb98-40d9-95e3-abfdaf1751d5
UPDATE event_nights
SET agenda = '[
  {"time": "21:00", "end_time": "21:30", "title": "Executive Coffee & Welcoming", "description": "Networking and warm welcome", "type": "networking"},
  {"time": "21:30", "end_time": "22:00", "title": "Activity: The Notes", "description": "", "type": "activity"},
  {"time": "22:00", "end_time": "22:15", "title": "First Talk: Angel Investor", "description": "Discusses what makes a business investable and sustainable", "type": "talk"},
  {"time": "22:15", "end_time": "22:30", "title": "Second Talk: Partnership Expert", "description": "Specialist in high-level networking and strategic alliances", "speaker_id": "660d4f59-aa6b-4acf-ba20-25aec8a5f58b", "type": "talk"},
  {"time": "22:30", "end_time": "23:00", "title": "Networking", "description": "Networking session", "type": "networking"},
  {"time": "23:00", "end_time": "23:15", "title": "Third Talk: Growth Framework", "description": "Strategic growth insights", "speaker_id": "28222bbf-e1ec-4b21-bfcf-5c1177a1f2a0", "type": "talk"},
  {"time": "23:15", "end_time": "23:30", "title": "Fourth Talk: Sustainability/CSR Expert", "description": "Focuses on building businesses that give back to the community", "speaker_id": "a280d606-9b53-4ccb-a04e-01acb1e6d645", "type": "talk"},
  {"time": "23:30", "end_time": "00:30", "title": "Panel: Legacy Builder", "description": "Building to Last", "type": "panel"},
  {"time": "00:30", "end_time": "01:30", "title": "Impact Auction", "description": "Networking activity", "type": "workshop"},
  {"time": "01:30", "end_time": "02:30", "title": "Suhoor", "description": "Closing and Suhoor", "type": "break"}
]'::jsonb
WHERE id = '7f9f24d2-fb98-40d9-95e3-abfdaf1751d5';