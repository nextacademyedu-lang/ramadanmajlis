-- Fix Speaker Roles and Topics
-- Strategy:
-- 1. Keynote Speakers: specific topic.
-- 2. Panel Speakers, VIP Guests, Moderators: Topic should be NULL (to avoid redundant display).
-- ==========================================
-- Night 1: The Compass (Feb 28)
-- ==========================================
-- Keynotes
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Strategic Visionary: Long-term Business Planning'
WHERE name ILIKE '%Ahmed Bayoumi%';
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Brand Architect: Personal Branding & Reputation'
WHERE id = '9b558815-37f9-4d0a-b85a-c9755fb8511b';
-- Hesham Alaraky
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Purpose Coach: Aligning Career with Values'
WHERE id = 'b74a122d-c34d-4a56-a425-89c9830bc66b';
-- Ebrahem Anwar
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Spiritual Guide: Philosophy of Intention'
WHERE id = '12f28c7b-abe6-4fcc-8053-8f43ed734f9b';
-- Heba abdelrazek
-- Panel: The Business Clinic
-- Assuming these are the panelists. Setting topic to NULL to avoid "Topic: Business Clinic"
UPDATE speakers
SET role = 'Panel Speaker',
    speaker_topic = NULL
WHERE id = '6562cd1f-7527-437b-91d8-0985ffa60cde';
-- Abdelrahman Kandil (Or Moderator?)
UPDATE speakers
SET role = 'Panel Speaker',
    speaker_topic = NULL
WHERE id = '6aaa3334-0366-4396-831e-b470a5cc529f';
-- Heba Alashry
-- VIP Guests (Cleanup topics)
UPDATE speakers
SET role = 'VIP Guest',
    speaker_topic = NULL
WHERE id IN (
        '1fca6f8f-a35f-4921-9c59-1b883ce8f1e3',
        -- Mostafa Gabr
        '87e03b2a-3c23-47bd-9358-14575ddf8f6e',
        -- AbduAllah Farouk
        'b701d51c-52d3-4d95-9240-330ff4255bbd',
        -- Adie Hatem
        '0efad21a-cd58-470d-83cc-f57cd96556a2',
        -- Ayman Elsherbiny
        '88edd19e-9cca-4498-874e-04d2adf81da8',
        -- Ahmed Awara
        '5e5aa579-cf50-4f34-879f-93ca49e2c6b7' -- Mohab Osama
    );
-- ==========================================
-- Night 2: The Resilience (Mar 05)
-- ==========================================
-- Keynotes
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Financial Consultant: Cash Flow & Inflation Proofing'
WHERE id = '1c5c6693-546c-4706-8eee-fdd8dd5f6370';
-- Hala Abdallah
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Operations Expert: Systems, AI & Scaling'
WHERE id = 'd129e4a4-5b2b-49a4-bdae-b6a5647b548c';
-- Kareem Turky
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Executive Psychologist: Mental Resilience'
WHERE id = 'e3b6cddd-316b-4914-b2c3-2969f725b962';
-- Mohamed Elshafie
-- Panel: From Manual to Magical
-- Setting topic to NULL
UPDATE speakers
SET role = 'Panel Speaker',
    speaker_topic = NULL
WHERE id = 'dca1d1b8-48f3-4464-a3e8-307ccbbb9f62';
-- Omar El Monayar
UPDATE speakers
SET role = 'Panel Speaker',
    speaker_topic = NULL
WHERE id = '281ee86a-a34b-474f-bac2-30ccde7d1430';
-- Abdelrahman Sleem
UPDATE speakers
SET role = 'Panel Speaker',
    speaker_topic = NULL
WHERE id = '01329d3e-3ee2-4309-97f1-cddf38e214fb';
-- Mohamed Elsherif
UPDATE speakers
SET role = 'Panel Speaker',
    speaker_topic = NULL
WHERE id = '85e2ee63-a02c-4acd-999b-a1ab2d54fc86';
-- Hany Ahmed
-- Moderator
UPDATE speakers
SET role = 'Moderator',
    speaker_topic = NULL
WHERE id = '264becfc-b6bb-453a-a84a-ff9602b109d7';
-- Muhammed Mekky
-- VIP Guests
UPDATE speakers
SET role = 'VIP Guest',
    speaker_topic = NULL
WHERE id IN (
        'befa9dc0-18e0-4a02-bfa6-72fb36c87569',
        -- Mohamed Abuelela
        'e7db3769-b76d-4a38-adf4-c9b7c2a161a1',
        -- Ahmed Othman
        '030f7ad5-f495-4473-9be8-f56fa0264f10',
        -- Mohamed Ghanayem
        'f0d5ff83-eacc-43eb-9f63-f9626ee9b2b5',
        -- karim Besheir
        '4d4dcdb1-87b8-4ffc-bd9a-2c524c831aff',
        -- Bassem Magdy
        'b557a608-a9a4-405c-b08c-ea0584019bf5',
        -- Ehab Mesallum
        'a76a8b5b-c52d-4e66-b0c3-d80b2738c223' -- Abdul Rahman Amer
    );
-- ==========================================
-- Night 3: The Legacy (Mar 12)
-- ==========================================
-- Keynotes
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Angel Investor: Investable & Sustainable Business'
WHERE id = 'dff22ee2-d5d5-4583-b9bd-8cb724048aae';
-- Sarah Khalifa
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Partnership Expert: Strategic Alliances'
WHERE id = '660d4f59-aa6b-4acf-ba20-25aec8a5f58b';
-- Nadeem Barakat
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Growth Framework'
WHERE id = '28222bbf-e1ec-4b21-bfcf-5c1177a1f2a0';
-- Salah Khalil
UPDATE speakers
SET role = 'Keynote Speaker',
    speaker_topic = 'Sustainability/CSR Expert: Community Impact'
WHERE id = 'a280d606-9b53-4ccb-a04e-01acb1e6d645';
-- Abdullah Amer
-- VIP Guests
UPDATE speakers
SET role = 'VIP Guest',
    speaker_topic = NULL
WHERE id IN (
        '3defd107-0cf6-439d-82b7-eb3956409c6a',
        -- Mohamed Galal Elzeky
        '4a346e9e-b645-4a8e-8965-44eb37795e14',
        -- Taha Ali
        '7fc3a9f0-d457-444c-a6e4-f17f38372c18',
        -- Mohamed EL Ashwal
        '8b9b420d-d545-4978-add5-f8b105dfaa70',
        -- Mohamed Matrod
        '833a5125-4324-4378-84ee-b70d4b7c9ca6',
        -- Medhat Yassin
        'c81d2fc9-4184-44d1-98c2-f3a1e3118cae',
        -- Ahmed Fakhry
        'c8a6f084-aeea-4176-80c1-c8498af1c5d2' -- amr Khalil
    );