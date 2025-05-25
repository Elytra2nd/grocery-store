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
        route: (name: string, params?: Record<string, any>) => string;
    }
}

// Route helper function yang menggunakan Ziggy data
function route(name: string, params?: Record<string, any>): string {
    try {
        // Get Ziggy data from page props
        const pageElement = document.getElementById('app')?.getAttribute('data-page');
        if (pageElement) {
            const pageData = JSON.parse(pageElement);
            const { ziggy } = pageData.props;

            if (ziggy && ziggy.routes && ziggy.routes[name]) {
                const routeData = ziggy.routes[name];
                let url = routeData.uri;

                // Add base URL
                if (ziggy.url) {
                    url = ziggy.url + '/' + url;
                }

                // Replace parameters
                if (params && routeData.parameters) {
                    routeData.parameters.forEach((param: string) => {
                        if (params[param]) {
                            url = url.replace(`{${param}}`, params[param]);
                        }
                    });
                }

                return url;
            }

            // Fallback to manual routes
            if (ziggy && ziggy.routes && ziggy.routes[name]) {
                return ziggy.routes[name];
            }
        }

        console.warn(`Route ${name} not found`);
        return '/';
    } catch (error) {
        console.error('Error in route helper:', error);
        return '/';
    }
}

// Make route function globally available
window.route = route as typeof window.route;

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
