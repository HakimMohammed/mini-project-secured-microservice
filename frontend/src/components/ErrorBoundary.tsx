import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary component to catch and handle React rendering errors.
 * Prevents the entire app from crashing when a component throws an error.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="max-w-md w-full mx-4 p-6 bg-card rounded-lg shadow-lg border">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-destructive mb-4">
                                Something went wrong
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="text-left mb-6 p-4 bg-muted rounded text-sm overflow-auto">
                                    <p className="font-mono text-destructive">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
