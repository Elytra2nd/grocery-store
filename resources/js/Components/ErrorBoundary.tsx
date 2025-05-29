// components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<
    React.PropsWithChildren<{}>,
    ErrorBoundaryState
> {
    constructor(props: React.PropsWithChildren<{}>) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Oops! Terjadi kesalahan
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Silakan refresh halaman atau hubungi administrator
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                        >
                            Refresh Halaman
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
