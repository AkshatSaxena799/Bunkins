import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle, Package, Truck, Share2, Copy, ArrowRight,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/ui/Toast';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      api.getOrder(orderId)
        .then(data => setOrder(data))
        .catch(() => {})
        .finally(() => setLoading(false));

      api.getMyReferralCode()
        .then(data => setReferralCode(data.referral_code))
        .catch(() => {});
    } else {
      setLoading(false);
    }
  }, [orderId, isAuthenticated]);

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      showToast('Referral code copied! Share it with friends 🎉', 'success');
    }
  };

  return (
    <div className="container page-enter" style={{ maxWidth: 640, margin: '0 auto', padding: 'var(--space-10) var(--space-4)' }}>
      {/* Success Animation */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--mint) 0%, var(--mint-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-6)',
          animation: 'count-pop 0.5s ease',
        }}>
          <CheckCircle size={40} color="white" />
        </div>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Order Placed! 🎉</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-lg)' }}>
          Thank you for shopping with Bunkins!
        </p>
      </div>

      {/* Order Details */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Package size={20} style={{ color: 'var(--navy)' }} />
          <h3>Order Details</h3>
        </div>

        <div className="light-accent-card" style={{
          padding: 'var(--space-4)', background: 'var(--sky-light)',
          borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)',
        }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-1)' }}>
            Order ID
          </p>
          <p style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}>
            {orderId}
          </p>
        </div>

        {order && (
          <>
            <div style={{ borderBottom: '1px solid var(--gray-100)', marginBottom: 'var(--space-4)' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0',
                  fontSize: 'var(--text-sm)',
                }}>
                  <span>{item.name} (Size: {item.size}) × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {order.discount_amount > 0 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)',
                color: 'var(--mint-dark)', marginBottom: 'var(--space-2)',
              }}>
                <span>Discount</span>
                <span>-₹{order.discount_amount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontWeight: 700, fontSize: 'var(--text-lg)', paddingTop: 'var(--space-3)',
              borderTop: '2px solid var(--gray-200)',
            }}>
              <span>Total Paid</span>
              <span>₹{order.total_amount?.toLocaleString('en-IN')}</span>
            </div>
          </>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          marginTop: 'var(--space-4)', padding: 'var(--space-3)',
          background: 'rgba(95, 216, 143, 0.1)', borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)', color: 'var(--mint-dark)',
        }}>
          <Truck size={16} />
          <span>Expected delivery in 5-7 business days</span>
        </div>
      </div>

      {/* Referral CTA */}
      {isAuthenticated && referralCode && (
        <div className="card light-accent-card" style={{
          padding: 'var(--space-6)', marginBottom: 'var(--space-6)',
          background: 'linear-gradient(135deg, var(--sky-light) 0%, #e8f4fb 100%)',
          border: '2px solid var(--sky)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Share2 size={20} style={{ color: 'var(--navy)' }} />
            <h3 style={{ fontSize: 'var(--text-lg)' }}>Share & Earn ₹100!</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
            Share your referral code with friends. When they make their first purchase, you both get ₹100 off!
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <div className="referral-code-box" style={{
              flex: 1, padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 700, fontFamily: 'monospace', fontSize: 'var(--text-lg)',
              textAlign: 'center', letterSpacing: 2,
              border: '2px dashed var(--mint)',
            }}>
              {referralCode}
            </div>
            <button className="btn btn-primary" onClick={copyReferralCode}>
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
        <Link to="/products" className="btn btn-primary btn-lg">
          Continue Shopping <ArrowRight size={18} />
        </Link>
        {isAuthenticated && (
          <Link to="/account/orders" className="btn btn-outline btn-lg">
            View Orders
          </Link>
        )}
      </div>
    </div>
  );
}
