// resources/js/Hooks/useFlashMessage.tsx
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface FlashMessage {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
}

export default function useFlashMessage() {
    const { flash } = usePage().props as any;
    const [notification, setNotification] = useState<FlashMessage | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setNotification({
                type: 'success',
                title: 'Berhasil!',
                message: flash.success
            });
        } else if (flash?.error) {
            setNotification({
                type: 'error',
                title: 'Error!',
                message: flash.error
            });
        } else if (flash?.warning) {
            setNotification({
                type: 'warning',
                title: 'Peringatan!',
                message: flash.warning
            });
        } else if (flash?.info) {
            setNotification({
                type: 'info',
                title: 'Informasi',
                message: flash.info
            });
        }
    }, [flash]);

    const clearNotification = () => {
        setNotification(null);
    };

    return {
        notification,
        clearNotification
    };
}
