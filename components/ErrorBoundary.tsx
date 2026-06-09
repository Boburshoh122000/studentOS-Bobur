import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #1e293b, #581c87, #1e293b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '28rem',
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
              We're sorry, but something unexpected happened. Please try again.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'rgba(127,29,29,0.3)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    color: '#fca5a5',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#9333ea',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
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
