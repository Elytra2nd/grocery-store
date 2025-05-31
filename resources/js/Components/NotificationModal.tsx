// resources/js/Components/NotificationModal.tsx
import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

interface NotificationModalProps {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onClose: () => void;
}

export default function NotificationModal({
    show,
    type,
    title,
    message,
    onClose
}: NotificationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            // Auto close after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for animation to complete
    };

    if (!show) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    icon: 'text-green-400',
                    title: 'text-green-800',
                    message: 'text-green-600',
                    button: 'bg-green-100 hover:bg-green-200 text-green-800'
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: 'text-red-400',
                    title: 'text-red-800',
                    message: 'text-red-600',
                    button: 'bg-red-100 hover:bg-red-200 text-red-800'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    icon: 'text-yellow-400',
                    title: 'text-yellow-800',
                    message: 'text-yellow-600',
                    button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    icon: 'text-blue-400',
                    title: 'text-blue-800',
                    message: 'text-blue-600',
                    button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                };
        }
    };

    const styles = getTypeStyles();

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${
                        isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={handleClose}
                />

                {/* Modal panel */}
                <div className={`inline-block align-bottom ${styles.bg} rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 ${
                    isVisible ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
                }`}>
                    <div>
                        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${styles.bg} border ${styles.border}`}>
                            <div className={styles.icon}>
                                {getIcon()}
                            </div>
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className={`text-lg leading-6 font-medium ${styles.title}`}>
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className={`text-sm ${styles.message}`}>
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                        <button
                            type="button"
                            className={`inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors ${styles.button}`}
                            onClick={handleClose}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
