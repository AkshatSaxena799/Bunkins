import { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unknown runtime error',
    };
  }

  componentDidCatch(error, info) {
    console.error('Bunkins frontend runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Poppins, sans-serif' }}>
          <div style={{ maxWidth: 720, width: '100%', background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <h1 style={{ marginBottom: 12, fontSize: 24, color: '#073763' }}>Bunkins failed to render</h1>
            <p style={{ marginBottom: 8, color: '#334155' }}>A frontend runtime error occurred.</p>
            <p style={{ marginBottom: 16, color: '#334155' }}><strong>Error:</strong> {this.state.errorMessage}</p>
            <p style={{ color: '#475569' }}>Try refreshing the page. If it persists, restart with npm start and check browser console.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </AppErrorBoundary>
);
