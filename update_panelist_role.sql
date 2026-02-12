-- Update existing speakers with role 'Panelist' to 'Panel Speaker'
UPDATE speakers
SET role = 'Panel Speaker'
WHERE role = 'Panelist';