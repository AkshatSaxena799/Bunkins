import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import api from '../api/client';
import ProductCard from '../components/product/ProductCard';
import { useAuth } from '../contexts/AuthContext';

export default function WishlistPage() {
  const { productIds } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    if (isAuthenticated) {
      api
        .getWishlist()
        .then(data => setProducts(data.products || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // For guests, fetch products individually
      Promise.all(productIds.map(id => api.getProduct(id).catch(() => null)))
        .then(results => setProducts(results.filter(Boolean)))
        .finally(() => setLoading(false));
    }
  }, [productIds, isAuthenticated]);

  if (!loading && products.length === 0) {
    return (
      <div className="container page-enter">
        <div className="wishlist-empty">
          <Heart size={64} />
          <h2>Your wishlist is empty</h2>
          <p>Save items you love for later!</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Discover Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-enter section">
      <h1 style={{ marginBottom: 'var(--space-2)' }}>
        <Heart
          size={28}
          style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8, color: 'var(--coral)' }}
          fill="var(--coral)"
        />
        My Wishlist
      </h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-8)' }}>
        {products.length} item{products.length !== 1 ? 's' : ''} saved
      </p>

      {loading ? (
        <div className="product-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="product-card">
              <div className="skeleton" style={{ aspectRatio: '3/4' }} />
              <div style={{ padding: 'var(--space-4)' }}>
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 20, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
