-- Drop table if exists to ensure clean slate (Warning: This deletes existing speakers data!)
DROP TABLE IF EXISTS speakers;

-- Create Speakers Table
CREATE TABLE speakers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    image_url TEXT,
    night_id UUID REFERENCES event_nights(id) ON DELETE SET NULL, -- Link to a specific night (optional)
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists (although dropping table drops policies, this is safe practice)
DROP POLICY IF EXISTS "Public speakers are viewable by everyone" ON speakers;

-- Create Policy for Public Read
CREATE POLICY "Public speakers are viewable by everyone" 
ON speakers FOR SELECT 
USING (true);

-- Create Policy for Admin Insert/Update/Delete
-- Using Service Role or authenticated users
CREATE POLICY "Admin full access" 
ON speakers FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert some initial speakers based on the images found
INSERT INTO speakers (name, title, image_url, display_order) VALUES
('Abdelrahman Kandil', 'Founder Next Academy', '/speakers/abdelrahman_kandil.jpeg', 1),
('Kareem Turky', 'CEO fulfly', '/speakers/karim_turky.jpeg', 2),
('Khaled Abo Husienn', 'Wellness Coach', '/speakers/khaled_abo_husienn.jpg', 3),
('Salah Khalil', 'Sales Leader', '/speakers/Salah_Khalil.jpg', 4),
('Ahmed Hesham', 'CEO moraqmen', '/speakers/Ahmed_Hesham_AL_Tablawy.jpg', 5),
('Ayman Elsherbiny', 'Founder STJEgypt', '/speakers/Ayman_Elsherbiny.jpg', 6),
('Mohamed Abuelela', 'Co-Founder AM ALTA MODA', '/speakers/Mohamed_Abuelela.png', 7),
('Hesham Alaraky', 'Speaker', '/speakers/hesham_el_elraki.jpeg', 8),
('Mohamed El Ashwal', 'Speaker', '/speakers/Mohamed_EL_Ashwal.jpg', 9),
('Nadeem Barakat', 'Speaker', '/speakers/Nadeem_Barakat.jpg', 10),
('Taha Ali', 'Speaker', '/speakers/Taha_Ali.jpg', 11),
('Yasser Abdelmoniem', 'Speaker', '/speakers/Yasser_Abdelmoniem.jpg', 12);
