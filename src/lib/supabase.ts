import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Initialize Supabase Client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Not needed for React Native
    },
});

export function getPublicUrl(path: string | null | undefined, bucket: string = 'property-photos') {
    if (!path) return '';

    // If it's already a full URL
    if (path.startsWith('http')) {
        // If it belongs to a different Supabase project, try to fix it
        const currentHost = new URL(supabaseUrl).host;
        try {
            const url = new URL(path);
            if (url.host !== currentHost) {
                // Check if it's a Supabase URL from another project
                if (url.host.endsWith('.supabase.co')) {
                    return path.replace(url.host, currentHost);
                }
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
