import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/ui/Toast';

export interface ToastProps {
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    duration?: number;
}

interface ToastContextType {
    showToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<(ToastProps & { id: number }) | null>(null);
    const toastIdRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout>();

    const showToast = useCallback(({ message, type, duration = 2500 }: ToastProps) => {
        const id = ++toastIdRef.current;
        setToast({ message, type, duration, id });

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setToast((prev) => (prev?.id === id ? null : prev));
        }, duration);
    }, []);

    const hideToast = useCallback((id: number) => {
        setToast((prev) => (prev?.id === id ? null : prev));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onHide={() => hideToast(toast.id)}
                />
            )}
        </ToastContext.Provider>
    );
};
