// Upload speaker photos to Supabase Storage and update event_users
// Usage: node scripts/upload-speaker-photos.mjs

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://dqduxsimueexppfiinpw.supabase.co';
// Need service role key - pass as env variable
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.error('❌ Set SUPABASE_SERVICE_ROLE_KEY env variable');
    console.error('Run: $env:SUPABASE_SERVICE_ROLE_KEY="your-key-here"; node scripts/upload-speaker-photos.mjs');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

const SPEAKERS_DIR = path.resolve('public/speakers');
const BUCKET = 'event-uploads';
const STORAGE_PATH = 'speaker-photos';

async function main() {
    // Get all speaker event_users (the ones we created with password majlis2026)
    const { data: users, error } = await supabase
        .from('event_users')
        .select('id, name, photo_url')
        .eq('password', 'majlis2026');

    if (error) { console.error('❌ Failed to fetch users:', error); return; }
    
    console.log(`Found ${users.length} speaker event_users to process\n`);

    let uploaded = 0, skipped = 0, failed = 0;

    for (const user of users) {
        const localPath = user.photo_url; // e.g. "/speakers/ahmed_awara.jpg"
        
        if (!localPath || localPath.startsWith('http')) {
            console.log(`⏭️  ${user.name} - already has URL, skipping`);
            skipped++;
            continue;
        }

        const filename = path.basename(localPath);
        const filePath = path.join(SPEAKERS_DIR, filename);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${user.name} - file not found: ${filePath}`);
            failed++;
            continue;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : ext === '.jpeg' || ext === '.jpg' ? 'image/jpeg' : 'image/webp';

        const storagePath = `${STORAGE_PATH}/${filename}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer, {
                contentType,
                upsert: true
            });

        if (uploadError) {
            console.log(`❌ ${user.name} - upload failed: ${uploadError.message}`);
            failed++;
            continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // Update event_user photo_url
        const { error: updateError } = await supabase
            .from('event_users')
            .update({ photo_url: publicUrl })
            .eq('id', user.id);

        if (updateError) {
            console.log(`❌ ${user.name} - DB update failed: ${updateError.message}`);
            failed++;
            continue;
        }

        console.log(`✅ ${user.name} → ${publicUrl}`);
        uploaded++;
    }

    console.log(`\n=== Done ===`);
    console.log(`✅ Uploaded: ${uploaded}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
}

main();
