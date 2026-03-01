const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://altolajlghoxgvebuvrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG9sYWpsZ2hveGd2ZWJ1dnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk5NTYsImV4cCI6MjA4NzEwNTk1Nn0.VOf_U5BvWO3WInPR1Wa0C3Ncz4aZCHFtuW1-XuGYeCM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixPropertyPhotos() {
    const dbPropertyId = '67bb03f2-54b7-4992-abec-a05ab034fa66';
    const storageFolderId = '14787c1a-48c0-4d55-9adc-82f581c2a3ef';

    console.log(`Fixing property ${dbPropertyId} using photos from folder ${storageFolderId}...`);

    const photos = [
        `https://altolajlghoxgvebuvrn.supabase.co/storage/v1/object/public/property-photos/${storageFolderId}/5uv271.jpg`,
        `https://altolajlghoxgvebuvrn.supabase.co/storage/v1/object/public/property-photos/${storageFolderId}/x7npif.jpg`,
        `https://altolajlghoxgvebuvrn.supabase.co/storage/v1/object/public/property-photos/${storageFolderId}/xhtrir.jpg`
    ];

    const toInsert = photos.map((url, i) => ({
        id_propriete: dbPropertyId,
        url_photo: url,
        est_photo_principale: i === 0
    }));

    const { data, error } = await supabase.from('photos').insert(toInsert);

    if (error) {
        console.error("Error inserting photos:", error);
    } else {
        console.log("Successfully linked 3 photos to the property!");
    }
}

fixPropertyPhotos();
