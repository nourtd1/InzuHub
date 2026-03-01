const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://altolajlghoxgvebuvrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG9sYWpsZ2hveGd2ZWJ1dnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk5NTYsImV4cCI6MjA4NzEwNTk1Nn0.VOf_U5BvWO3WInPR1Wa0C3Ncz4aZCHFtuW1-XuGYeCM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPhotos() {
    console.log("Fetching properties...");
    const { data: properties, error: pError } = await supabase
        .from('proprietes')
        .select('id_propriete, titre')
        .limit(5)
        .order('date_publication', { ascending: false });

    if (pError) {
        console.error("Error fetching properties:", pError);
        return;
    }

    console.log(`Found ${properties.length} properties.`);

    for (const p of properties) {
        const { data: photos, error: phError } = await supabase
            .from('photos')
            .select('*')
            .eq('id_propriete', p.id_propriete);

        if (phError) {
            console.error(`Error fetching photos for property ${p.id_propriete}:`, phError);
            continue;
        }

        console.log(`Property: ${p.titre} (${p.id_propriete})`);
        console.log(`Photos count: ${photos.length}`);
        photos.forEach(ph => {
            console.log(`  - URL: ${ph.url_photo} (Primary: ${ph.est_photo_principale})`);
        });
    }
}

checkPhotos();
