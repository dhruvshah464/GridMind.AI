'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.componentName || 'Unknown'}:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="gm-surface p-6 flex flex-col items-center justify-center gap-4 min-h-[120px] text-center">
          <div className="w-10 h-10 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-[var(--text-1)]">
              {this.props.componentName ? `${this.props.componentName} failed to load` : 'Something went wrong'}
            </p>
            <p className="text-xs text-[var(--text-3)]">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gm-surface-2 text-xs font-medium text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-hover)] transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
