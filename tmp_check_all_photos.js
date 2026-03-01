const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://altolajlghoxgvebuvrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG9sYWpsZ2hveGd2ZWJ1dnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk5NTYsImV4cCI6MjA4NzEwNTk1Nn0.VOf_U5BvWO3WInPR1Wa0C3Ncz4aZCHFtuW1-XuGYeCM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllPhotos() {
    console.log("Fetching ALL photos...");
    const { data: photos, error } = await supabase
        .from('photos')
        .select('*');

    if (error) {
        console.error("Error fetching photos:", error);
        return;
    }

    console.log(`Found ${photos.length} total photos in the 'photos' table.`);

    for (const ph of photos) {
        console.log(`- Photo ID: ${ph.id_photo}`);
        console.log(`  Property ID: ${ph.id_propriete}`);
        console.log(`  URL: ${ph.url_photo}`);
    }
}

checkAllPhotos();
