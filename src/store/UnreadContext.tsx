import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { conversationService } from '../services/conversationService';
import { useAuth } from '../hooks/useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UnreadContextType {
    totalUnread: number;
    setTotalUnread: (count: number) => void;
    refreshUnread: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType>({
    totalUnread: 0,
    setTotalUnread: () => { },
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
            const count = await conversationService.countUnreadMessages(user.id);
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
        const channel: RealtimeChannel = conversationService.subscribeToConversations(user.id, () => {
            refreshUnread();
        });

        return () => {
            conversationService.unsubscribeFromConversations(channel);
        };
    }, [user]);

    return (
        <UnreadContext.Provider value={{ totalUnread, setTotalUnread, refreshUnread }}>
            {children}
        </UnreadContext.Provider>
    );
}
