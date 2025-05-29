import { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="w-full min-h-screen h-full bg-white">
            <Head title="Fresh Market Collection" />
            {children}
        </div>
    );
}
