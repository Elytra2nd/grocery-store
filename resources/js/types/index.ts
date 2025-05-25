// resources/js/types/index.ts
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    phone?: string;
    address?: string;
    roles?: Role[];
}

export interface Role {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Perbaiki PageProps untuk mendukung generic
export interface PageProps<T = Record<string, unknown>> {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
}

// Extend PageProps untuk kasus spesifik
export interface PagePropsWithData<T> extends PageProps {
    data: T;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url?: string;
    path: string;
    per_page: number;
    prev_page_url?: string;
    to: number;
    total: number;
}

export interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

export interface ProductStatistics {
    total_sold: number;
    total_revenue: number;
    total_orders: number;
    average_order_quantity: number;
}

export interface DashboardStatistics {
    total_products: number;
    active_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    status?: string;
    stock_status?: string;
}
