import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/product/ProductCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    api.getProducts({ search: query, page_size: 24 })
      .then(data => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setSearchParams({ q: input.trim() });
    }
  };

  return (
    <div className="container page-enter section">
      <div style={{ maxWidth: 640, margin: '0 auto var(--space-10)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <SearchIcon size={20} style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--gray-400)',
          }} />
          <input
  className="input"
  placeholder="Search for kids clothing..."
  value={input}
  onChange={e => setInput(e.target.value)}
  autoFocus
  style={{
    // 1. Fluid Width
    width: '100%',
    maxWidth: '100%',

    height: 'clamp(44px, 8vh, 56px)', 
    fontSize: 'clamp(0.9rem, 2vw, 1.125rem)',

    paddingLeft: 'clamp(36px, 5vw, 48px)', 
    paddingRight: 'clamp(36px, 5vw, 48px)',

    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--gray-200)', // Added for better visibility
    outline: 'none'
  }}
/>
          {input && (
            <button type="button" onClick={() => { setInput(''); setSearchParams({}); }}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer',
              }}>
              <X size={18} />
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : query && products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
          <SearchIcon size={56} style={{ color: 'var(--gray-300)', marginBottom: 'var(--space-4)' }} />
          <h3>No products found</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>
            Try different keywords or browse our collection
          </p>
          <Link to="/products" className="btn btn-primary">Browse All Products</Link>
        </div>
      ) : products.length > 0 ? (
        <>
          <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
            {total} product{total !== 1 ? 's' : ''} found
          </p>
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : !query ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10) 0', color: 'var(--gray-400)' }}>
          <p>Start typing to search our collection</p>
        </div>
      ) : null}
    </div>
  );
}
