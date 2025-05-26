// resources/js/types/index.ts

// Base User and Role interfaces
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    phone?: string | null;
    address?: string | null;
    roles?: Role[];
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
}

// Product related interfaces
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image?: string | null;
    is_active: boolean;
    weight?: number;
    cost?: number;
    sku?: string;
    created_at: string;
    updated_at: string;
    order_items?: OrderItem[];
}

// Order related interfaces
export interface Order {
    id: number;
    order_number: string;
    user_id: number;
    total_amount: number;
    status: OrderStatus;
    notes?: string | null;
    shipping_address?: string | null;
    tracking_number?: string | null;
    shipping_cost?: number;
    discount_amount?: number;
    tax_amount?: number;
    shipped_at?: string | null;
    delivered_at?: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    created_at: string;
    updated_at: string;
    product?: Product;
}

// Order status type for better type safety
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Pagination interfaces
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Statistics interfaces
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

export interface OrderStatistics {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    today_orders: number;
    today_revenue: number;
    week_orders?: number;
    week_revenue?: number;
    month_orders?: number;
    month_revenue?: number;
    average_order_value?: number;
}

// Filter interfaces
export interface ProductFilters {
    search?: string;
    category?: string;
    status?: string;
    stock_status?: string;
    price_min?: number;
    price_max?: number;
    date_from?: string;
    date_to?: string;
}

export interface OrderFilters {
    tracking_number: string;
    amount_range: string;
    search?: string;
    status?: OrderStatus;
    date_from?: string;
    date_to?: string;
    user_id?: number;
    amount_min?: number;
    amount_max?: number;
}

// PERBAIKAN UTAMA: PageProps dengan generic yang benar
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    errors?: Record<string, string>;
    ziggy?: {
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
        location: string;
    };
};

// Form data interfaces
export type ProductFormData = {
    [key: string]: any; // Index signature untuk compatibility dengan useForm
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    image?: File | null;
    is_active: boolean;
    weight?: number;
    cost?: number;
    sku?: string;
};

export type OrderFormData = {
    [key: string]: any; // Index signature
    user_id: number | null;
    order_items: OrderItemFormData[];
    notes: string;
    shipping_address: string;
    status: OrderStatus;
    shipping_cost?: number;
    discount_amount?: number;
    tax_amount?: number;
    tracking_number?: string;
};

export type OrderItemFormData = {
    [key: string]: any; // Index signature
    product_id: number;
    product: Product;
    quantity: number;
    price: number;
};

export type UserFormData = {
    [key: string]: any; // Index signature
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    phone?: string;
    address?: string;
    roles?: string[];
};

// Update FormDataType
export type FormDataType = {
    [key: string]: any;
};

// Component prop interfaces
export interface TableColumn<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOverlayClick?: boolean;
}

// Utility types
export type SortDirection = 'asc' | 'desc';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type Theme = 'light' | 'dark';
