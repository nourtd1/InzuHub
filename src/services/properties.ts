
import { supabase } from '../lib/supabase';
import { Propriete } from '../types/database.types';

export const getProperties = async () => {
    const { data, error } = await supabase.from('proprietes').select('*').order('date_publication', { ascending: false });
    if (error) throw error;
    return data as Propriete[];
};

export const getPropertyById = async (id: string) => {
    const { data, error } = await supabase.from('proprietes').select('*').eq('id_propriete', id).single();
    if (error) throw error;
    return data as Propriete;
};
