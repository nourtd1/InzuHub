const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://altolajlghoxgvebuvrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG9sYWpsZ2hveGd2ZWJ1dnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mjk5NTYsImV4cCI6MjA4NzEwNTk1Nn0.VOf_U5BvWO3WInPR1Wa0C3Ncz4aZCHFtuW1-XuGYeCM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMove() {
    const tempPath = 'temp/14787c1a-48c0-4d55-9adc-82f581c2a3ef/p2dd6n.jpg';
    const finalPath = 'test_move_success.jpg';

    console.log(`Checking if ${tempPath} exists...`);
    const { data: list, error: lError } = await supabase.storage.from('property-photos').list('temp/14787c1a-48c0-4d55-9adc-82f581c2a3ef', { search: 'p2dd6n.jpg' });
    console.log("List result:", list);

    if (list && list.length > 0) {
        console.log(`Trying to move to ${finalPath}...`);
        const { data, error: mError } = await supabase.storage.from('property-photos').move(tempPath, finalPath);
        if (mError) {
            console.error("Move error:", mError);
        } else {
            console.log("Move success!", data);
        }
    } else {
        console.log("File not found in list.");
    }
}

testMove();
