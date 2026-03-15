import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Truck, Package, ChevronDown } from 'lucide-react';
import api from '../../api/client';
import { showToast } from '../../components/ui/Toast';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'returned'];
const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6',
  shipped: '#8b5cf6', delivered: '#10b981', returned: '#ef4444',
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.getOrders()
      .then(d => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status } : o
      ));
      showToast(`Order updated to ${status}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p style={{ color: 'var(--gray-500)' }}>{orders.length} orders</p>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)' }}>No orders yet</td></tr>
            ) : orders.map(order => (
              <tr key={order.id} style={{ cursor: 'pointer' }}
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                <td>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                <td>
                  <span style={{ fontWeight: 500 }}>
                    {order.user_id ? 'Registered User' : order.guest_name || order.guest_email || 'Guest'}
                  </span>
                </td>
                <td>{order.items?.length || 0} items</td>
                <td style={{ fontWeight: 600 }}>₹{order.total_amount?.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`admin-status admin-status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className="sort-select"
                    style={{ minWidth: 120, fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded Order Detail */}
      {expandedId && (() => {
        const order = orders.find(o => o.id === expandedId);
        if (!order) return null;
        return (
          <div className="admin-card" style={{ marginTop: 'var(--space-4)' }}>
            <h4 style={{ marginBottom: 'var(--space-3)' }}>Order Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              <div>
                <p style={{ color: 'var(--gray-500)' }}>Order ID</p>
                <p style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{order.id}</p>
              </div>
              <div>
                <p style={{ color: 'var(--gray-500)' }}>Shipping</p>
                <p>{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
              </div>
              {order.coupon_code && (
                <div>
                  <p style={{ color: 'var(--gray-500)' }}>Coupon</p>
                  <p>{order.coupon_code} (-₹{order.discount_amount})</p>
                </div>
              )}
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Size</th><th>Qty</th><th>Price</th></tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.size}</td>
                    <td>{item.quantity}</td>
                    <td>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
}
