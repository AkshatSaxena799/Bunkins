import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index = 0 }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="product-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        border: 'none',
      }}
    >
      {/* Absolute Wishlist Button (placed outside the Link to prevent mis-clicks) */}
      <motion.button
        className="product-card-wishlist"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        style={{
          position: 'absolute',
          top: 14, right: 14,
          zIndex: 20,
          background: 'var(--surface-card)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--gray-200)',
          width: 40, height: 40,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: wishlisted ? 'var(--pink)' : 'var(--text-on-surface)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} strokeWidth={wishlisted ? 0 : 1.5} />
      </motion.button>

      <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', position: 'relative' }}>
        <motion.div 
          className="product-card-image"
          whileHover="hover"
          style={{
            position: 'relative',
            aspectRatio: '3/4',
            backgroundColor: 'var(--sky-light)',
            overflow: 'hidden',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <motion.img
            src={product.images?.[0] || '/bunkins-logo.png'}
            alt={product.name}
            loading="lazy"
            variants={{
              hover: { scale: 1.05 }
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
          
          {product.images?.length > 1 && (
            <motion.img
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              loading="lazy"
              variants={{
                hover: { opacity: 1, scale: 1.05 }
              }}
              initial={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 2
              }}
            />
          )}
          
          {/* Top Badges */}
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, flexWrap: 'wrap', zIndex: 10 }}>
            {product.featured && <span style={{ background: 'var(--navy)', color: 'white', border: 'none', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New</span>}
            {product.tags?.includes('bestseller') && (
              <span style={{ background: '#ffbe00', color: 'var(--navy)', border: 'none', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bestseller</span>
            )}
          </div>
          
          {/* Quick Add Overlay */}
          <motion.div 
            variants={{
              hover: { opacity: 1, y: 0 }
            }}
            initial={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              bottom: 14, left: 14, right: 14,
              display: 'flex',
              gap: 8,
              zIndex: 10
            }}
          >
            <div className="product-card-quick-view" style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              color: 'var(--navy)',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
            }}>
              Quick View
            </div>
          </motion.div>
        </motion.div>
      </Link>
      
      <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="product-card-info" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: '0 var(--space-1)' }}>
          <div className="product-card-meta" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)', fontWeight: 700, opacity: 0.8 }}>
            {product.gender} · {product.category}
          </div>
          <h3 className="product-card-name">
            {product.name}
          </h3>
          <div className="product-card-price-wrap" style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <span className="product-card-price">₹{product.price?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
