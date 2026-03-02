import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/admin.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is missing');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function getPublicUrl(path: string | null | undefined, bucket: string = 'property-photos') {
    if (!path) return '';

    // If it's already a full URL
    if (path.startsWith('http')) {
        // If it belongs to a different Supabase project, try to fix it
        const currentHost = new URL(supabaseUrl).host;
        try {
            const url = new URL(path);
            if (url.host !== currentHost && url.host.endsWith('.supabase.co')) {
                // Replace the old project host with the new one
                return path.replace(url.host, currentHost);
            }
        } catch (e) {
            // Not a valid URL, continue to path logic
        }
        return path;
    }

    // Clean the path: if it starts with the bucket name followed by a slash, remove it
    let cleanPath = path;
    if (cleanPath.startsWith(`${bucket}/`)) {
        cleanPath = cleanPath.substring(bucket.length + 1);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    return data.publicUrl;
}
