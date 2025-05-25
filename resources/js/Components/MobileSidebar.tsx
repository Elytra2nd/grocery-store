// resources/js/Components/MobileSidebar.tsx
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';

interface MobileSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function MobileSidebar({ sidebarOpen, setSidebarOpen }: MobileSidebarProps): JSX.Element {
    if (!sidebarOpen) return <></>;

    return (
        <div className="fixed inset-0 flex z-40 md:hidden">
            <div
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                </div>
                <Sidebar children={undefined} />
            </div>
        </div>
    );
}
