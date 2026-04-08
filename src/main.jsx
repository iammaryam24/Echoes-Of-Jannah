import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { UserProvider } from './contexts/UserContext'
import './index.css'

// Error Boundary for catching runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cosmic flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold gradient-text mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-4">Please refresh the page to continue your spiritual journey.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <UserProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1A1B3A',
                color: '#fff',
                border: '1px solid #00F2FE',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#FFD700',
                  secondary: '#0A0B1A',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#0A0B1A',
                },
              },
            }}
          />
          <App />
        </UserProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);