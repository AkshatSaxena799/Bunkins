import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Shield,
  ChevronLeft,
  Minus,
  Plus,
} from 'lucide-react';
import api from '../api/client';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { showToast } from '../components/ui/Toast';
import ProductCard from '../components/product/ProductCard';
import ProductReviews from '../components/product/ProductReviews';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    api
      .getProduct(slug)
      .then(data => {
        setProduct(data);
        setSelectedImage(0);
        setSelectedSize('');
        setQuantity(1);
        // Fetch related products
        return api.getProducts({ category: data.category, page_size: 4 });
      })
      .then(data => {
        setRelated(
          (data.products || []).filter(p => p.slug !== slug).slice(0, 4)
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container page-enter">
        <div className="product-detail">
          <div>
            <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-xl)' }} />
          </div>
          <div>
            <div className="skeleton" style={{ height: 32, width: '80%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 40, width: '30%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 100, marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 48, width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <h2>Product not found</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-3)' }}>
          The product you're looking for doesn't exist.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    addItem(product, selectedSize, quantity);
    showToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-enter"
    >
      <div className="container">
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-4) 0',
          fontSize: 'var(--text-sm)',
          color: 'var(--gray-400)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Link to="/" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>Products</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-on-surface)' }}>{product.name}</span>
        </div>

        <motion.div 
          className="product-detail resp-product-detail-main"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: 'var(--space-12)' }}
        >
          {/* Image Gallery */}
          <motion.div variants={fadeInUp} className="resp-product-gallery" style={{ gap: 'var(--space-4)', height: 'fit-content' }}>
            {product.images?.length > 1 && (
              <div className="resp-product-thumbs" style={{ gap: 'var(--space-2)' }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      opacity: selectedImage === i ? 1 : 0.5,
                      transition: 'opacity 0.3s',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      aspectRatio: '3/4'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = selectedImage === i ? 1 : 0.5}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
            <div className="img-zoom-container" style={{ flex: 1, backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '3/4' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={product.images?.[selectedImage] || '/bunkins-logo.png'}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div variants={fadeInUp} style={{ padding: 'var(--space-4) 0' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {product.featured && <span className="badge badge-new" style={{ background: 'var(--navy)', color: 'white', border: 'none' }}>New Arrival</span>}
              {product.tags?.includes('bestseller') && <span className="badge badge-hot" style={{ background: 'var(--yellow)', color: 'var(--text-on-surface)', border: 'none' }}>Bestseller</span>}
              {product.tags?.includes('organic') && <span className="badge badge-organic" style={{ background: 'var(--sage)', color: 'white', border: 'none' }}>Organic</span>}
            </div>

            <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)', lineHeight: 1.1 }}>{product.name}</h1>

            <div style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-on-surface)', marginBottom: 'var(--space-6)' }}>
              ₹{product.price?.toLocaleString('en-IN')}
            </div>

            <p className="product-description" style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', marginBottom: 'var(--space-8)', lineHeight: 1.6 }}>
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="filter-section" style={{ marginBottom: 'var(--space-8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <h4>Select Size</h4>
                <button type="button" className="btn-link" style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--gray-500)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>Size Guide</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {product.sizes?.map(s => (
                  <button
                    key={s.size}
                    type="button"
                    className={`size-btn ${selectedSize === s.size ? 'selected' : ''} ${s.stock === 0 ? 'out-of-stock' : ''}`}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    {s.size}
                    {s.stock === 0 && (
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--gray-300)', transform: 'rotate(-15deg)' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="filter-section" style={{ marginBottom: 'var(--space-8)' }}>
              <h4>Quantity</h4>
              <div className="quantity-selector">
                <button type="button" className="quantity-btn" aria-label="Decrease" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={16} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button type="button" className="quantity-btn" aria-label="Increase" onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="resp-product-actions" style={{ marginBottom: 'var(--space-8)' }}>
              <button type="button" onClick={handleAddToCart} className="btn btn-primary hover-lift" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="btn btn-outline hover-lift product-detail-wishlist"
                style={{
                  width: 54, height: 54,
                  minWidth: 54,
                  padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: wishlisted ? 'var(--pink)' : 'var(--text-on-surface)',
                  borderColor: wishlisted ? 'var(--pink)' : 'var(--gray-200)',
                }}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="product-trust-badges">
              <div className="product-trust-item">
                <Truck size={18} style={{ color: 'var(--text-on-surface)' }} aria-hidden />
                <span>Free delivery over ₹999</span>
              </div>
              <div className="product-trust-item">
                <RotateCcw size={18} style={{ color: 'var(--text-on-surface)' }} aria-hidden />
                <span>Easy 15-day returns</span>
              </div>
              <div className="product-trust-item">
                <Shield size={18} style={{ color: 'var(--text-on-surface)' }} aria-hidden />
                <span>Secure SSL checkout</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <section className="section">
            <div className="section-header" style={{ textAlign: 'left' }}>
              <h2>You Might Also Like</h2>
            </div>
            <div className="product-grid">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
