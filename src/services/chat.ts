
import { supabase } from '../lib/supabase';
import { Conversation, Message, Database } from '../types/database.types';

export const getConversations = async (userId: string) => {
    const { data, error } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .or(`id_locataire.eq.${userId},id_proprietaire.eq.${userId}`);

    if (error) throw error;
    return data; // Needs proper typing mapping if complex
};

export const getMessages = async (conversationId: string) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('id_conversation', conversationId)
        .order('date_envoi', { ascending: true });

    if (error) throw error;
    return data as Message[];
};

export const sendMessage = async (message: Database['public']['Tables']['messages']['Insert']) => {
    const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

    if (error) throw error;
    return data as Message;
};
