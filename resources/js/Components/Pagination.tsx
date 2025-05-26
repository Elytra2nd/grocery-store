// resources/js/Components/Pagination.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface PaginationProps {
    links: PaginationLink[];
    meta: PaginationMeta;
    className?: string;
}

export default function Pagination({ links, meta, className = '' }: PaginationProps): JSX.Element {
    // Don't render if there's only one page
    if (meta.last_page <= 1) {
        return <></>;
    }

    return (
        <div className={`bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow ${className}`}>
            {/* Mobile pagination */}
            <div className="flex-1 flex justify-between sm:hidden">
                {meta.prev_page_url ? (
                    <Link
                        href={meta.prev_page_url}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
                    >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Previous
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        Previous
                    </span>
                )}

                {meta.next_page_url ? (
                    <Link
                        href={meta.next_page_url}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-150"
                    >
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Link>
                ) : (
                    <span className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
                        Next
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </span>
                )}
            </div>

            {/* Desktop pagination */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{meta.from || 0}</span>
                        {' '}to{' '}
                        <span className="font-medium">{meta.to || 0}</span>
                        {' '}of{' '}
                        <span className="font-medium">{meta.total}</span>
                        {' '}results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {links.map((link, index) => {
                            // Skip if no URL and not current page
                            if (!link.url && !link.active) {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            // Current page (active)
                            if (link.active) {
                                return (
                                    <span
                                        key={index}
                                        aria-current="page"
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium z-10 bg-indigo-50 border-indigo-500 text-indigo-600 ${
                                            index === 0 ? 'rounded-l-md' : ''
                                        } ${
                                            index === links.length - 1 ? 'rounded-r-md' : ''
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            // Regular link
                            return (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-150 ${
                                        index === 0 ? 'rounded-l-md' : ''
                                    } ${
                                        index === links.length - 1 ? 'rounded-r-md' : ''
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}

// Alternative simple pagination component
interface SimplePaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function SimplePagination({
    currentPage,
    lastPage,
    onPageChange,
    className = ''
}: SimplePaginationProps): JSX.Element {
    const generatePageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (lastPage <= maxVisible) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(lastPage);
            } else if (currentPage >= lastPage - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = lastPage - 4; i <= lastPage; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(lastPage);
            }
        }

        return pages;
    };

    if (lastPage <= 1) return <></>;

    return (
        <div className={`flex items-center justify-center space-x-1 ${className}`}>
            {/* Previous button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                <ChevronLeftIcon className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {generatePageNumbers().map((page, index) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-sm font-medium text-gray-500"
                        >
                            ...
                        </span>
                    );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                    <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium border ${
                            isActive
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-600 z-10'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {pageNum}
                    </button>
                );
            })}

            {/* Next button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                <ChevronRightIcon className="h-4 w-4" />
            </button>
        </div>
    );
}
