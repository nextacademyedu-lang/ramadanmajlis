-- Update Night 1: The Compass
UPDATE event_nights
SET title = 'The Compass (Vision, Values & Brand)',
    subtitle = 'Aligning professional success with spiritual purpose and personal identity.',
    description = 'Focus: Aligning professional success with spiritual purpose and personal identity. Key Activity: "The Identity Workshop" - A guided session where speakers help attendees refine their "Core Purpose Statement" to ensure their business reflects their values.',
    agenda = '[
    {"time": "09:00 PM", "title": "Executive Coffee & Welcoming", "description": "Networking and Welcome Drink"},
    {"time": "09:30 PM", "title": "The Power Session", "description": "Panel & Hands-on Work: Strategic Visionary, Brand Architect, Purpose Coach, Spiritual Guide"},
    {"time": "12:30 AM", "title": "Strategic Networking & Suhoor", "description": "The Opportunity Exchange"},
    {"time": "02:00 AM", "title": "Closing & Goodbyes", "description": ""}
  ]'::jsonb,
    color_theme = 'emerald'
WHERE date = '2026-02-26';
-- Update Night 2: The Resilience
UPDATE event_nights
SET title = 'The Resilience (Growth, Finance & Well-being)',
    subtitle = 'Navigating market volatility and maintaining mental and financial health.',
    description = 'Focus: Navigating market volatility and maintaining mental and financial health. Key Activity: "The Business Clinic" - A live "Shark Tank" style feedback session where speakers diagnose real business problems submitted by the audience and provide immediate prescriptions.',
    agenda = '[
    {"time": "09:00 PM", "title": "Executive Coffee & Welcoming", "description": "Networking and Welcome Drink"},
    {"time": "09:30 PM", "title": "The Power Session", "description": "Panel & Hands-on Work: Financial Consultant, Operations Expert, Executive Psychologist, Resilience Mentor"},
    {"time": "12:30 AM", "title": "Strategic Networking & Suhoor", "description": "The Opportunity Exchange"},
    {"time": "02:00 AM", "title": "Closing & Goodbyes", "description": ""}
  ]'::jsonb,
    color_theme = 'amber'
WHERE date = '2026-03-05';
-- Update Night 3: The Legacy
UPDATE event_nights
SET title = 'The Legacy (Impact, Networking & Partnerships)',
    subtitle = 'Moving from individual success to collective influence and long-term impact.',
    description = 'Focus: Moving from individual success to collective influence and long-term impact. Key Activity: "The Mastermind Roundtables" - Small group rotations where attendees sit with the speakers to discuss high-level collaboration and partnership opportunities.',
    agenda = '[
    {"time": "09:00 PM", "title": "Executive Coffee & Welcoming", "description": "Networking and Welcome Drink"},
    {"time": "09:30 PM", "title": "The Power Session", "description": "Panel & Hands-on Work: Angel Investor, Partnership Expert, Sustainability/CSR Expert, Legacy Builder"},
    {"time": "12:30 AM", "title": "Strategic Networking & Suhoor", "description": "The Opportunity Exchange"},
    {"time": "02:00 AM", "title": "Closing & Goodbyes", "description": ""}
  ]'::jsonb,
    color_theme = 'blue'
WHERE date = '2026-03-12';