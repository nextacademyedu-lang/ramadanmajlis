// Fix location values in the database - trim whitespace/newlines
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://afokabguqrexeqkfretn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2thYmd1cXJleGVxa2ZyZXRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjI1MDI3MiwiZXhwIjoyMDgxODI2MjcyfQ.s3cHqxtDVnMGWiFeJDjbXtSLs0h4HjC1bbJNwKNGiZg'
);

async function fixLocations() {
    // Get all nights
    const { data: nights, error } = await supabase
        .from('event_nights')
        .select('id, location, title');

    if (error) {
        console.error('Error fetching nights:', error);
        return;
    }

    console.log('Current nights:');
    for (const night of nights) {
        const trimmed = night.location ? night.location.trim() : night.location;
        const needsFix = night.location !== trimmed;
        console.log(`  ${night.title}: "${night.location}" -> needsFix: ${needsFix}`);
        
        if (needsFix && trimmed) {
            const { error: updateError } = await supabase
                .from('event_nights')
                .update({ location: trimmed })
                .eq('id', night.id);

            if (updateError) {
                console.error(`  Error updating ${night.title}:`, updateError);
            } else {
                console.log(`  ✅ Fixed: "${trimmed}"`);
            }
        }
    }
    console.log('\nDone!');
}

fixLocations();
