import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/client';

export default function CmsPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.getCmsPage(slug)
      .then(data => setPage(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container section page-enter">
        <div className="skeleton" style={{ height: 40, width: 250, marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 'var(--space-3)', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 'var(--space-3)', borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ height: 20, width: '70%', borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container section page-enter" style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
        <h2>Page Not Found</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>
          This page doesn't exist or has been unpublished.
        </p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="container page-enter section">
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)',
      }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <article style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 'var(--space-6)' }}>{page.title}</h1>
        <div
          className="cms-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}
