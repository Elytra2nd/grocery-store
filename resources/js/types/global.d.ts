import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

declare global {
    interface Window {
        route: (name: string, params?: Record<string, any>, absolute?: boolean) => string;
        axios: any;
    }

    var route: (name: string, params?: Record<string, any>, absolute?: boolean) => string;
    var axios: any;
}

export {};
