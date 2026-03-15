import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ShoppingBag, CreditCard, Truck, Shield, ArrowLeft, Tag,
  ChevronRight, Gift, CheckCircle, MapPin, Plus, LogIn,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { showToast } from '../components/ui/Toast';

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext();

  const [step, setStep] = useState(1); // 1=info, 2=shipping, 3=review
  const [loading, setLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Shipping fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Coupon & Referral
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');

  // Load saved addresses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.getAddresses().then(data => {
        const addrs = data.addresses || [];
        setSavedAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) {
          setSelectedAddressId(def.id);
          fillFromAddress(def);
        } else {
          setShowNewAddressForm(true);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const fillFromAddress = (addr) => {
    setFullName(addr.full_name || '');
    setPhone(addr.phone || '');
    setAddress(addr.address_line || '');
    setCity(addr.city || '');
    setState(addr.state || '');
    setPincode(addr.pincode || '');
  };

  const selectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    fillFromAddress(addr);
    setShowNewAddressForm(false);
  };

  if (items.length === 0) {
    return (
      <div className="container page-enter" style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
        <ShoppingBag size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }} />
        <h2>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Add items before checking out
        </p>
        <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
      </div>
    );
  }

  // Auth gate — require login before checkout
  if (!isAuthenticated) {
    return (
      <div className="container page-enter" style={{ textAlign: 'center', padding: 'var(--space-20) 0', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-10)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🔐</div>
          <h2 style={{ marginBottom: 'var(--space-3)' }}>Sign in to checkout</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-sm)' }}>
            Create an account or sign in to place your order. Your cart is saved!
          </p>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: 'var(--space-3)' }}
            onClick={() => outletContext?.openAuth?.()}
          >
            <LogIn size={18} /> Sign In / Create Account
          </button>
          <Link to="/cart" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            ← Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice >= 999 ? 0 : 99;
  const totalDiscount = couponDiscount + referralDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount + shipping);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const result = await api.validateCoupon(couponCode, totalPrice);
      setCouponDiscount(result.discount);
      setCouponMessage(result.message);
      setCouponApplied(true);
      showToast(result.message, 'success');
    } catch (err) {
      setCouponMessage(err.message);
      setCouponDiscount(0);
      setCouponApplied(false);
      showToast(err.message, 'error');
    }
  };

  const handleApplyReferral = async () => {
    if (!referralCode) return;
    try {
      const result = await api.applyReferral(referralCode);
      setReferralDiscount(result.discount);
      setReferralMessage(result.message);
      setReferralApplied(true);
      showToast(result.message, 'success');
    } catch (err) {
      setReferralMessage(err.message);
      setReferralDiscount(0);
      setReferralApplied(false);
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
          image: item.image,
        })),
        shipping_address: address,
        shipping_city: city,
        shipping_state: state,
        shipping_pincode: pincode,
        shipping_full_name: fullName,
        shipping_phone: phone,
        coupon_code: couponApplied ? couponCode : null,
      };

      const order = await api.createOrder(orderData);

      // Complete referral if one was applied
      if (referralApplied && referralCode) {
        try {
          await api.completeReferral(referralCode, order.id, user?.id || null);
        } catch (e) {
          console.error('Referral completion error:', e);
        }
      }

      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      showToast(err.message || 'Order failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = true;
  const canProceedStep2 = (selectedAddressId && !showNewAddressForm) || (address && city && state && pincode);

  return (
    <div className="container page-enter">
      <div style={{ padding: 'var(--space-4) 0 var(--space-2)' }}>
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      <h1 style={{ marginBottom: 'var(--space-6)' }}>Checkout</h1>

      {/* Progress Steps */}
      <div className="resp-checkout-steps" style={{ marginBottom: 'var(--space-8)' }}>
        {['Contact Info', 'Shipping', 'Review & Pay'].map((label, i) => (
          <div key={label} className="resp-checkout-step">
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-full)',
              background: step > i + 1 ? 'var(--mint)' : step === i + 1 ? 'var(--navy)' : 'var(--gray-200)',
              color: (step > i + 1 || step === i + 1) ? 'var(--text-on-dark)' : 'var(--text-on-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--text-sm)', fontWeight: 700,
              transition: 'all 0.3s ease',
            }}>
              {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span style={{
              fontSize: 'var(--text-sm)', fontWeight: step === i + 1 ? 600 : 400,
              color: step === i + 1 ? 'var(--text-on-surface)' : 'var(--text-muted)',
            }}>{label}</span>
            {i < 2 && <ChevronRight size={16} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />}
          </div>
        ))}
      </div>

      <div className="cart-layout">
        {/* Left: Form Content */}
        <div>
          {/* Step 1: Contact Info */}
          {step === 1 && (
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)', color: 'var(--text-on-dark)' }}>Contact Information</h3>

              <div style={{
                  padding: 'var(--space-4)', background: 'var(--sky-light)',
                  borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)',
                }}>
                  <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--text-on-surface)' }}>{user.full_name}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-on-surface)', opacity: 0.9 }}>{user.email}</p>
                </div>

              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                disabled={!canProceedStep1} onClick={() => setStep(2)}>
                Continue to Shipping <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)', color: 'var(--text-on-dark)' }}>Shipping Address</h3>

              {/* Saved address picker */}
              {savedAddresses.length > 0 && (
                <div className="checkout-address-list">
                  {savedAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      className={`checkout-address-card${selectedAddressId === addr.id && !showNewAddressForm ? ' selected' : ''}`}
                      onClick={() => selectSavedAddress(addr)}
                    >
                      {addr.is_default && <span className="address-default-badge">Default</span>}
                      <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{addr.full_name} · {addr.phone}</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                        {addr.address_line}, {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`checkout-address-card checkout-address-new${showNewAddressForm ? ' selected' : ''}`}
                    onClick={() => { setShowNewAddressForm(true); setSelectedAddressId(null); }}
                  >
                    <Plus size={16} style={{ display: 'inline', marginRight: 6 }} />
                    Use a different address
                  </button>
                </div>
              )}

              {/* New address form (shown if no saved addresses or user clicked add new) */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="checkout-new-address-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input className="input" placeholder="Recipient name" value={fullName}
                        onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label>Phone *</label>
                      <input className="input" type="tel" placeholder="10-digit mobile" value={phone}
                        onChange={e => setPhone(e.target.value)} required />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label>Street Address *</label>
                    <input className="input" placeholder="House no., Street, Area" value={address}
                      onChange={e => setAddress(e.target.value)} required />
                  </div>

                  <div className="resp-checkout-city-state" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="input-group">
                      <label>City *</label>
                      <input className="input" placeholder="City" value={city}
                        onChange={e => setCity(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label>State *</label>
                      <input className="input" placeholder="State" value={state}
                        onChange={e => setState(e.target.value)} required />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 'var(--space-2)' }}>
                    <label>PIN Code *</label>
                    <input className="input" placeholder="6-digit PIN code" value={pincode}
                      onChange={e => setPincode(e.target.value)} maxLength={6} required />
                  </div>
                </div>
              )}

              <div className="resp-checkout-nav" style={{ marginTop: 'var(--space-6)' }}>
                <button className="btn btn-outline btn-lg" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary btn-lg"
                  disabled={!canProceedStep2} onClick={() => setStep(3)}>
                  Review Order <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <h3 style={{ marginBottom: 'var(--space-6)', color: 'var(--text-on-dark)' }}>Review Your Order</h3>

              {/* Cart Items Summary */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                {items.map(item => (
                  <div key={`${item.product_id}-${item.size}`} style={{
                    display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3) 0',
                    borderBottom: '1px solid var(--gray-100)',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      width: 50, height: 65, borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden', flexShrink: 0, background: 'var(--sky-light)',
                    }}>
                      <img src={item.image || '/bunkins-logo.png'} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--text-on-dark)' }}>{item.name}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-on-dark)', opacity: 0.85 }}>
                        Size: {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-on-dark)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Shipping info */}
              <div style={{
                padding: 'var(--space-4)', background: 'var(--sky-light)',
                borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)',
              }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--text-on-surface)' }}>
                  <Truck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Shipping to:
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-on-surface)', opacity: 0.9 }}>
                  {address}, {city}, {state} - {pincode}
                </p>
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', display: 'block', color: 'var(--text-on-dark)' }}>
                  <Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Coupon Code
                </label>
                <div className="resp-checkout-line-input">
                  <input className="input" placeholder="e.g. WELCOME10" value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponApplied}
                    style={{ flex: 1, fontSize: 'var(--text-sm)' }}
                  />
                  <button className={`btn ${couponApplied ? 'btn-ghost' : 'btn-outline'}`}
                    style={{ whiteSpace: 'nowrap', minWidth: 80 }}
                    onClick={couponApplied ? () => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(''); setCouponMessage(''); } : handleApplyCoupon}
                    disabled={!couponCode && !couponApplied}>
                    {couponApplied ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {couponMessage && (
                  <p style={{ fontSize: 'var(--text-xs)', color: couponApplied ? 'var(--mint-dark)' : 'var(--red)', marginTop: 'var(--space-1)' }}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Referral */}
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', display: 'block', color: 'var(--text-on-dark)' }}>
                  <Gift size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Referral Code
                </label>
                <div className="resp-checkout-line-input">
                  <input className="input" placeholder="e.g. BUNKINS-ABC123" value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    disabled={referralApplied}
                    style={{ flex: 1, fontSize: 'var(--text-sm)' }}
                  />
                  <button className={`btn ${referralApplied ? 'btn-ghost' : 'btn-outline'}`}
                    style={{ whiteSpace: 'nowrap', minWidth: 80 }}
                    onClick={referralApplied ? () => { setReferralApplied(false); setReferralDiscount(0); setReferralCode(''); setReferralMessage(''); } : handleApplyReferral}
                    disabled={!referralCode && !referralApplied}>
                    {referralApplied ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {referralMessage && (
                  <p style={{ fontSize: 'var(--text-xs)', color: referralApplied ? 'var(--mint-dark)' : 'var(--red)', marginTop: 'var(--space-1)' }}>
                    {referralMessage}
                  </p>
                )}
              </div>

              <div className="resp-checkout-nav">
                <button className="btn btn-outline btn-lg" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary btn-lg"
                  disabled={loading} onClick={handlePlaceOrder}>
                  {loading ? 'Placing Order...' : (
                    <>
                      <CreditCard size={18} /> Place Order — ₹{finalTotal.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Items ({totalItems})</span>
            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="cart-summary-row" style={{ color: 'var(--mint-dark)' }}>
              <span>Coupon ({couponCode})</span>
              <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}
          {referralDiscount > 0 && (
            <div className="cart-summary-row" style={{ color: 'var(--mint-dark)' }}>
              <span>Referral Bonus</span>
              <span>-₹{referralDiscount}</span>
            </div>
          )}
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE ✨' : `₹${shipping}`}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="product-trust-item" style={{ fontSize: 'var(--text-xs)' }}>
              <Shield size={14} style={{ color: 'var(--mint)' }} />
              <span>Secure & encrypted checkout</span>
            </div>
            <div className="product-trust-item" style={{ fontSize: 'var(--text-xs)' }}>
              <Truck size={14} style={{ color: 'var(--mint)' }} />
              <span>Free delivery over ₹999</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
