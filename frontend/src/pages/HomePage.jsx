import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/client';
import ProductCard from '../components/product/ProductCard';
import { showToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';
import { useTimeTheme } from '../contexts/TimeThemeContext';

// Storybook Layer Components (Routed via BackgroundManager for Isolated QA Testing)
import { 
  HeroBackgroundLayer,
  ProductsBackgroundLayer
} from '../components/layout/BackgroundManager';

const CATEGORIES = [
  { name: 'Boys', gender: 'boys', image: '/images/boys_collection.png' },
  { name: 'Girls', gender: 'girls', image: '/images/girls_collection.png' },
  { name: 'Unisex', gender: 'unisex', image: '/images/unisex_collection.png' },
  { name: 'New Arrivals', featured: true, image: '/images/new_arrivals_collection.png' },
];

// Fallback featured products when API is empty or unavailable (e.g. static build, backend down)
const FALLBACK_FEATURED_PRODUCTS = [
  { id: 1, slug: 'boys-briefs-3-pack', name: 'Boys Briefs 3-Pack', price: 449, images: ['/images/products/inv_boys_briefs_pack.png'], gender: 'boys', category: 'bottoms', tags: ['innerwear', 'organic', 'briefs', 'bestseller'], featured: true },
  { id: 2, slug: 'girls-panties-3-pack', name: 'Girls Panties 3-Pack', price: 449, images: ['/images/products/inv_girls_briefs_pack.png'], gender: 'girls', category: 'bottoms', tags: ['innerwear', 'panties', 'cotton', 'pastel'], featured: true },
  { id: 3, slug: 'rompers-2-pack', name: 'Rompers 2-Pack', price: 799, images: ['/images/products/inv_rompers_pack.png'], gender: 'unisex', category: 'sets', tags: ['romper', 'baby', 'cozy', 'soft'], featured: true },
  { id: 4, slug: 'night-suit-set', name: 'Night Suit Set', price: 699, images: ['/images/products/inv_night_suit_set.png'], gender: 'unisex', category: 'sets', tags: ['sleepwear', 'night suit', 'cozy', 'jersey'], featured: true },
  { id: 5, slug: 'essentials-bundle-3-3-3', name: 'Essentials Bundle (3+3+3)', price: 999, images: ['/images/products/inv_essentials_bundle.png'], gender: 'unisex', category: 'sets', tags: ['bundle', 'essentials', 'value', 'bestseller'], featured: true },
  { id: 6, slug: 'boys-tshirt-graphic', name: 'Boys T-shirt (Graphic)', price: 499, images: ['/images/products/inv_boys_graphic_tee.png'], gender: 'boys', category: 'tops', tags: ['graphic tee', 'dinosaur', 'playful'], featured: true },
  { id: 7, slug: 'boys-shorts', name: 'Boys Shorts', price: 449, images: ['/images/products/inv_boys_shorts.png'], gender: 'boys', category: 'bottoms', tags: ['shorts', 'casual', 'comfort'], featured: true },
  { id: 8, slug: 'girls-dress', name: 'Girls Dress', price: 599, images: ['/images/products/yellow_dress.png'], gender: 'girls', category: 'dresses', tags: ['dress', 'floral'], featured: true },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

// Replaced 3D R3F shapes with 2D Storybook Layers

export default function HomePage() {
  const { theme } = useTimeTheme();
  const n = theme === 'night';
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProducts({ featured: true, page_size: 8 })
      .then(data => {
        const list = data?.products?.length ? data.products : FALLBACK_FEATURED_PRODUCTS;
        setFeatured(list);
      })
      .catch(() => setFeatured(FALLBACK_FEATURED_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);


  /* Unified night background + stars across hero, collections, featured (no color gaps) */
  const nightStars = n ? Array.from({ length: 100 }, (_, i) => ({
    left: `${(i * 13 + 7) % 100}%`,
    top: `${(i * 11 + 3) % 100}%`,
    size: 1 + (i % 3),
    delay: (i * 0.1) % 4,
    duration: 2 + (i % 3),
  })) : [];

  return (
    <div className={`page-enter ${n ? 'home-night-wrap' : ''}`}>
      {n && (
        <div className="home-night-stars" aria-hidden="true">
          {nightStars.map((s, i) => (
            <span
              key={i}
              className="home-night-star"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </div>
      )}
      {/* Editorial Storybook Hero Section */}
      <section className="resp-hero" style={{
        position: 'relative',
        height: 'min(88vh, 860px)',
        minHeight: 560,
        backgroundColor: 'transparent',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        marginBottom: '0' // Changed to map seamlessly to next section
      }}>
        
        {/* Layer 1-3: Sunrise Illustration (Smart Routed) */}
        <HeroBackgroundLayer />
        
        {/* Render content on Glass container to preserve contrast over sky */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: n ? 'linear-gradient(to bottom, rgba(10,22,40,0.5), rgba(10,22,40,0))' : 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0))', pointerEvents: 'none' }} />
        
        <motion.div 
          className="container resp-hero-content" 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <motion.span variants={fadeInUp} style={{ 
            fontSize: 'var(--text-sm)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em',
            color: 'var(--text-accent)',
            marginBottom: 'var(--space-6)',
            display: 'block',
            fontWeight: 500
          }}>
            The New Standard
          </motion.span>
          
          <motion.h1 variants={fadeInUp} className="resp-hero-title" style={{ 
            marginBottom: 'var(--space-6)',
            color: 'var(--text-on-surface)',
            letterSpacing: '-0.03em'
          }}>
            Essentials for the<br />Modern Playground
          </motion.h1>
          
          <motion.p variants={fadeInUp} style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--text-accent)', 
            marginBottom: 'var(--space-10)',
            maxWidth: 500,
            margin: '0 auto var(--space-8)',
            lineHeight: 1.5
          }}>
            Premium organic cotton basics designed for comfort, durability, and effortless style.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="resp-hero-cta">
            <Link to="/products" className="btn" style={{
              backgroundColor: n ? '#fef3c7' : 'var(--navy)',
              color: n ? '#0f1729' : 'var(--white)',
              padding: '16px 28px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: 'var(--text-sm)',
              boxShadow: n ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(7, 55, 99, 0.15)',
              transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.5s ease',
              willChange: 'transform'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Shop Collection
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Curated Collections (Town Scene or Jungle Clearing) */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden', paddingTop: 'var(--space-12)', zIndex: 2, background: n ? 'transparent' : undefined }}>
        <ProductsBackgroundLayer />
        
        <motion.div 
          className="container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          style={{ position: 'relative', zIndex: 10 }}
        >
          <motion.div variants={fadeInUp} className="resp-collections-head" style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em', color: 'var(--text-on-surface)' }}>The Collections</h2>
            <Link to="/products" style={{ color: 'var(--text-accent)', textDecoration: 'underline', fontSize: 'var(--text-sm)' }}>View All</Link>
          </motion.div>
          
          <div className="resp-collections-grid">
            {CATEGORIES.map(cat => (
              <motion.div key={cat.name} variants={fadeInUp} whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                <Link
                  to={cat.featured ? '/products?featured=true' : `/products?gender=${cat.gender}`}
                  className="collection-link-card"
                  style={{
                    display: 'block',
                    position: 'relative',
                    aspectRatio: '4/5',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'var(--text-on-surface)'
                  }}
                >
                  <div 
                    className="collection-image-bg"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${cat.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 0
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    padding: 'var(--space-6)',
                    background: n ? 'linear-gradient(to top, rgba(15,23,41,0.92) 0%, rgba(15,23,41,0) 100%)' : 'linear-gradient(to top, rgba(7,55,99,0.9) 0%, rgba(7,55,99,0) 100%)',
                    zIndex: 2,
                    transition: 'background 0.4s ease',
                  }}>
                    <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)', color: 'var(--white)' }}>
                      {cat.name}
                    </h3>
                    <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: n ? 'rgba(254,243,199,0.9)' : 'var(--sky)' }}>
                      Shop Now →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Products — same night background, no gap */}
      <section className="section" style={{ position: 'relative', backgroundColor: n ? 'transparent' : 'var(--sky)', overflow: 'hidden', transition: 'background 0.6s ease', zIndex: 2 }}>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
            <h2 style={{ color: 'var(--text-on-surface)' }}>
              <Star
                size={24}
                style={{
                  display: 'inline',
                  color: 'var(--yellow)',
                  fill: 'var(--yellow)',
                  verticalAlign: 'middle',
                  marginRight: '8px',
                }}
              />
              Featured Products
            </h2>
            <p style={{ color: 'var(--text-accent)' }}>Handpicked favorites your kids will love</p>
          </motion.div>

          {loading ? (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="product-card">
                  <div
                    className="skeleton"
                    style={{ aspectRatio: '3/4' }}
                  />
                  <div style={{ padding: 'var(--space-4)' }}>
                    <div
                      className="skeleton"
                      style={{
                        height: 12,
                        width: '50%',
                        marginBottom: 8,
                      }}
                    />
                    <div
                      className="skeleton"
                      style={{ height: 16, width: '80%', marginBottom: 8 }}
                    />
                    <div
                      className="skeleton"
                      style={{ height: 20, width: '40%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link to="/products" className="btn btn-secondary btn-lg">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}
