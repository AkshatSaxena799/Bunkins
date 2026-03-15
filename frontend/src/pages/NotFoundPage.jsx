import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container page-enter" style={{
      textAlign: 'center', padding: 'var(--space-20) 0',
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontSize: 'clamp(72px, 24vw, 120px)', fontWeight: 800, lineHeight: 1,
        background: 'linear-gradient(135deg, var(--sky) 0%, var(--mint) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', marginBottom: 'var(--space-4)',
      }}>
        404
      </div>
      <h2 style={{ marginBottom: 'var(--space-3)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--gray-500)', maxWidth: 400, marginBottom: 'var(--space-8)', lineHeight: 1.6 }}>
        Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={18} /> Go Home
        </Link>
        <Link to="/products" className="btn btn-outline btn-lg">
          <Search size={18} /> Browse Products
        </Link>
      </div>
    </div>
  );
}
