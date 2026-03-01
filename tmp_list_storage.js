const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://altolajlghoxgvebuvrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG9sYWpsZ2hveGd2ZWJ1dnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk5NTYsImV4cCI6MjA4NzEwNTk1Nn0.VOf_U5BvWO3WInPR1Wa0C3Ncz4aZCHFtuW1-XuGYeCM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listStorage() {
    console.log("Listing root of 'property-photos'...");
    const { data: root, error: rError } = await supabase.storage.from('property-photos').list('', { limit: 100 });
    if (rError) console.error(rError);
    else console.log("Root content:", root.map(f => `${f.name} (${f.id ? 'file' : 'folder'})`));

    console.log("\nListing 'temp' folder...");
    const { data: temp, error: tError } = await supabase.storage.from('property-photos').list('temp', { limit: 100 });
    if (tError) console.error(tError);
    else console.log("'temp' content:", temp.map(f => `${f.name} (${f.id ? 'file' : 'folder'})`));

    // Check if there is a temp subfolder for the user
    const userId = '14787c1a-48c0-4d55-9adc-82f581c2a3ef';
    console.log(`\nListing 'temp/${userId}' folder...`);
    const { data: userTemp, error: utError } = await supabase.storage.from('property-photos').list(`temp/${userId}`, { limit: 100 });
    if (utError) console.error(utError);
    else console.log(`'temp/${userId}' content:`, userTemp.map(f => `${f.name} (${f.id ? 'file' : 'folder'})`));
}

listStorage();
