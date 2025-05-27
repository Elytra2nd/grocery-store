// resources/js/app.tsx
import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Route helper function
function route(name: string, params?: Record<string, any>, absolute?: boolean): string {
    try {
        const currentOrigin = window.location.origin;

        const routes: Record<string, string> = {
            'dashboard': '/dashboard',
            'admin.dashboard': '/admin/dashboard',
            'admin.products.index': '/admin/products',
            'admin.products.create': '/admin/products/create',
            'admin.products.show': '/admin/products/:id',
            'admin.products.edit': '/admin/products/:id/edit',
            'admin.orders.index': '/admin/orders',
            'admin.orders.create': '/admin/orders/create',
            'profile.edit': '/profile',
            'logout': '/logout',
            'password.request': '/forgot-password',
            'login': '/login',

        };

        let url = routes[name];
        if (!url) {
            console.warn(`Route ${name} not found`);
            return '/';
        }

        if (params) {
            if (typeof params === 'object' && params !== null) {
                Object.entries(params).forEach(([key, value]) => {
                    url = url.replace(`:${key}`, String(value));
                });
            } else {
                url = url.replace(/:id/, String(params));
            }
        }

        return absolute ? currentOrigin + url : url;

    } catch (error) {
        console.error('Error in route helper:', error);
        return '/';
    }
}

// Make route function globally available
if (typeof window !== 'undefined') {
    window.route = route;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4F46E5',
    },
});
