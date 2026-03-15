import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTimeTheme } from '../contexts/TimeThemeContext';
import { useState } from 'react';
import { motion } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function CartPage() {
  const { theme } = useTimeTheme();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="container page-enter"
        style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Add some adorable items for your little ones!</p>
          <Link to="/products" className="btn hover-lift" style={{
            background: 'var(--navy)', color: 'white', padding: '16px 32px', borderRadius: 'var(--radius-full)',
            textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-sm)'
          }}>
            Start Shopping
          </Link>
        </div>
      </motion.div>
    );
  }

  const shipping = totalPrice >= 999 ? 0 : 99;
  const finalTotal = totalPrice - discount + shipping;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="container page-enter"
    >
      <div style={{ padding: 'var(--space-8) 0 var(--space-6)', borderBottom: '1px solid var(--gray-200)', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-on-surface)' }}>Shopping Bag <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.6em' }}>({totalItems})</span></h1>
      </div>

      <div className="cart-layout" style={{ gap: 'var(--space-10)', alignItems: 'start' }}>
        {/* Cart Items */}
        <motion.div 
          className="cart-items"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
        >
          {items.map(item => (
            <motion.div variants={fadeInUp} key={`${item.product_id}-${item.size}`} className="resp-cart-item" style={{
              gap: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--gray-100)'
            }}>
              <Link to={`/products/${item.slug}`} className="resp-cart-thumb" style={{ flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '3/4', background: 'var(--gray-50)' }}>
                <img src={item.image || '/bunkins-logo.png'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Link>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="resp-cart-head">
                  <Link to={`/products/${item.slug}`} style={{ fontSize: 'var(--text-lg)', color: 'var(--text-on-surface)', textDecoration: 'none', lineHeight: 1.2, marginBottom: 'var(--space-1)' }}>
                    {item.name}
                  </Link>
                  <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-on-surface)' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'auto' }}>
                  Size: {item.size}
                </div>
                
                <div className="resp-cart-controls" style={{ marginTop: 'var(--space-4)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-full)' }}>
                    <button
                      style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-on-surface)' }}
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0 12px', minWidth: 32, textAlign: 'center', fontSize: 'var(--text-sm)' }}>{item.quantity}</span>
                    <button
                      style={{ padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-on-surface)' }}
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.product_id, item.size)}
                    className="cart-item-remove"
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cart Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="cart-summary"
          style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-6))', background: theme === 'night' ? 'var(--gray-50)' : 'var(--surface-card)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-200)' }}
        >
          <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', color: 'var(--text-on-surface)' }}>Order Summary</h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>
            <span>Subtotal ({totalItems} items)</span>
            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>

          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', color: 'var(--mint-dark)' }}>
              <span>Discount</span>
              <span>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)', color: 'var(--text-muted)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--gray-200)' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE ✨' : `₹${shipping}`}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-6)', fontSize: 'var(--text-2xl)', color: 'var(--text-on-surface)' }}>
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>

          {totalPrice < 999 && (
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--mint-dark)', background: 'rgba(95, 216, 143, 0.1)',
              padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', textAlign: 'center'
            }}>
              Add ₹{(999 - totalPrice).toLocaleString('en-IN')} more for free shipping!
            </div>
          )}

          <Link to="/checkout" className="btn btn-primary hover-lift" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            Proceed to Checkout
          </Link>
          
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            <Link to="/products" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textDecoration: 'underline' }}>
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

