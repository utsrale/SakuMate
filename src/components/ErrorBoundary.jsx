import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    backgroundColor: '#ffebeb',
                    color: '#c0392b',
                    height: '100vh',
                    fontFamily: 'monospace',
                    overflow: 'auto'
                }}>
                    <h1>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>Details</summary>
                        <h3>{this.state.error && this.state.error.toString()}</h3>
                        <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </details>
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={() => {
                                // Hard reset attempt
                                if (window.indexedDB) {
                                    window.indexedDB.deleteDatabase('SakuMateDB');
                                }
                                localStorage.clear();
                                window.location.reload();
                            }}
                            style={{
                                padding: '10px 20px',
                                background: '#c0392b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            🔥 EMERGENCY RESET DATA
                        </button>
                        <p style={{ marginTop: '10px', fontSize: '12px' }}>Warning: This will delete all your data.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
