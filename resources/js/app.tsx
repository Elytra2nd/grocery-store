// resources/js/app.tsx
import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Extend the Window interface to include the custom route function
declare global {
    interface Window {
        route: (name: string, params?: Record<string, any>, absolute?: boolean) => string;
        Ziggy?: {
            routes: Record<string, any>;
            url: string;
            location: string;
        };
    }
}

// Enhanced route helper function that uses Ziggy data from shared props
function route(name: string, params?: Record<string, any>, absolute: boolean = true): string {
    try {
        // Get Ziggy data from window (will be set by Inertia)
        const ziggy = window.Ziggy;

        if (!ziggy || !ziggy.routes) {
            console.warn('Ziggy data not available');
            return '/';
        }

        const routeData = ziggy.routes[name];
        if (!routeData) {
            console.warn(`Route "${name}" not found`);
            return '/';
        }

        let url = routeData.uri || '';

        // Handle domain-specific routes
        if (routeData.domain) {
            url = `${routeData.domain}/${url}`;
        }

        // Replace route parameters
        if (params && routeData.parameters && routeData.parameters.length > 0) {
            routeData.parameters.forEach((param: string) => {
                const value = params[param];
                if (value !== undefined) {
                    url = url.replace(`{${param}}`, encodeURIComponent(String(value)));
                    url = url.replace(`{${param}?}`, encodeURIComponent(String(value)));
                } else {
                    // Handle optional parameters
                    url = url.replace(`{${param}?}`, '');
                }
            });
        }

        // Add query parameters
        const routeParams = routeData.parameters || [];
        const queryParams = params ? Object.keys(params).filter(key => !routeParams.includes(key)) : [];

        if (queryParams.length > 0) {
            const queryString = queryParams
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(String(params![key]))}`)
                .join('&');
            url += (url.includes('?') ? '&' : '?') + queryString;
        }

        // Add base URL if absolute is true
        if (absolute && ziggy.url && !url.startsWith('http')) {
            // Clean up slashes
            const baseUrl = ziggy.url.replace(/\/$/, '');
            const cleanUrl = url.replace(/^\//, '');
            url = cleanUrl ? `${baseUrl}/${cleanUrl}` : baseUrl;
        }

        // Clean up multiple slashes
        url = url.replace(/([^:]\/)\/+/g, '$1');

        return url;
    } catch (error) {
        console.error('Error in route helper:', error);
        return '/';
    }
}

// Make route function globally available
window.route = route as any;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        // Make Ziggy data available globally before rendering
        if (props.initialPage.props.ziggy) {
            window.Ziggy = props.initialPage.props.ziggy as {
                routes: Record<string, any>;
                url: string;
                location: string;
            };
        }

        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4F46E5',
    },
});

export { route };
