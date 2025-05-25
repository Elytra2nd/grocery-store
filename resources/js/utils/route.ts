// resources/js/utils/routes.ts
export const routes = {
    // User routes
    'dashboard': '/dashboard',
    'profile.edit': '/profile',
    'logout': '/logout',

    // Admin routes
    'admin.dashboard': '/admin/dashboard',
    'admin.products.index': '/admin/products',
    'admin.products.create': '/admin/products/create',
    'admin.products.show': (id: number) => `/admin/products/${id}`,
    'admin.products.edit': (id: number) => `/admin/products/${id}/edit`,
    'admin.orders.index': '/admin/orders',
    'admin.orders.pending': '/admin/orders/pending',
    'admin.orders.processing': '/admin/orders/processing',
    'admin.orders.shipped': '/admin/orders/shipped',
    'admin.orders.completed': '/admin/orders/completed',
    'admin.users.index': '/admin/users',
    'admin.users.active': '/admin/users/active',
    'admin.users.new': '/admin/users/new',
    'admin.reports.index': '/admin/reports',
    'admin.reports.sales': '/admin/reports/sales',
    'admin.reports.products': '/admin/reports/products',
    'admin.reports.customers': '/admin/reports/customers',
    'admin.reports.financial': '/admin/reports/financial',
    'admin.settings.index': '/admin/settings',
    'admin.settings.general': '/admin/settings/general',
    'admin.settings.store': '/admin/settings/store',
    'admin.settings.payment': '/admin/settings/payment',
    'admin.settings.shipping': '/admin/settings/shipping',
    'admin.categories.index': '/admin/categories',
    'admin.products.low-stock': '/admin/products/low-stock',
};

export function route(name: string, params?: any): string {
    const routeTemplate = routes[name as keyof typeof routes];

    if (typeof routeTemplate === 'function') {
        return routeTemplate(params);
    }

    if (typeof routeTemplate === 'string') {
        // Return relative URL to avoid CORS issues
        return routeTemplate;
    }

    console.warn(`Route ${name} not found`);
    return '/';
}

// Make route function globally available
declare global {
    var route: typeof route;
}

if (typeof window !== 'undefined') {
    // Avoid conflict with existing global 'route' (e.g., from Ziggy)
    (window as any).customRoute = route;
}
