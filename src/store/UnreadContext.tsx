import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { conversationService } from '../services/conversationService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface UnreadContextType {
    totalUnread: number;
    refreshUnread: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType>({
    totalUnread: 0,
    refreshUnread: async () => { },
});

export function useUnread() {
    return useContext(UnreadContext);
}

export function UnreadProvider({ children }: PropsWithChildren) {
    const { user } = useAuth();
    const [totalUnread, setTotalUnread] = useState(0);

    const refreshUnread = async () => {
        if (!user) return;
        try {
            const count = await conversationService.countTotalUnread(user.id);
            setTotalUnread(count);
        } catch (error) {
            console.error('Error refreshing unread count:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            setTotalUnread(0);
            return;
        }

        refreshUnread();

        // Subscribe to messages changes to update unread dynamically
        const channel = supabase
            .channel('unread-count-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, () => {
                refreshUnread();
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages'
            }, () => {
                refreshUnread();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <UnreadContext.Provider value={{ totalUnread, refreshUnread }}>
            {children}
        </UnreadContext.Provider>
    );
}
