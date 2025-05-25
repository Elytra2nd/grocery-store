// resources/js/utils/route.ts
import { usePage } from '@inertiajs/react';

export function route(name: string, params?: Record<string, any>): string {
    try {
        const { ziggy } = usePage().props as any;

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

        console.warn(`Route ${name} not found in Ziggy`);
        return '/';

    } catch (error) {
        console.error('Error in route helper:', error);
        return '/';
    }
}

// Make route function globally available
// @ts-ignore
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.route = route;
}

export default route;
