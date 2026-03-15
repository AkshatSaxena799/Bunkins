import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import api from '../../api/client';
import { showToast } from '../../components/ui/Toast';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', min_order_value: 0,
    max_discount: 0, usage_limit: 100, active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = () => {
    setLoading(true);
    api.getCoupons()
      .then(d => setCoupons(d.coupons || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchCoupons, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.deleteCoupon(id);
      showToast('Coupon deleted', 'success');
      fetchCoupons();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createCoupon({
        ...form,
        code: form.code.toUpperCase(),
        value: parseFloat(form.value),
        min_order_value: parseFloat(form.min_order_value) || 0,
        max_discount: parseFloat(form.max_discount) || 0,
        usage_limit: parseInt(form.usage_limit) || 100,
      });
      showToast('Coupon created!', 'success');
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', min_order_value: 0, max_discount: 0, usage_limit: 100, active: true });
      fetchCoupons();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Coupons</h1>
          <p style={{ color: 'var(--gray-500)' }}>{coupons.length} coupons</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Used/Limit</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2].map(i => <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 20 }} /></td></tr>)
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)' }}>No coupons yet</td></tr>
            ) : coupons.map(coupon => (
              <tr key={coupon.id}>
                <td>
                  <span style={{
                    fontFamily: 'monospace', fontWeight: 700, padding: '4px 10px',
                    background: 'var(--sky-light)', borderRadius: 'var(--radius-md)',
                  }}>
                    {coupon.code}
                  </span>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{coupon.type}</td>
                <td style={{ fontWeight: 600 }}>
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                </td>
                <td>₹{coupon.min_order_value || 0}</td>
                <td>{coupon.usage_count || 0}/{coupon.usage_limit}</td>
                <td>{coupon.active ? '✅' : '❌'}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                    onClick={() => handleDelete(coupon.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showForm && (
        <>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Create Coupon</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Code *</label>
                  <input className="input" placeholder="e.g. SUMMER25" value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label>Type *</label>
                    <select className="input" value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Value *</label>
                    <input className="input" type="number" min={0} value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label>Min Order (₹)</label>
                    <input className="input" type="number" min={0} value={form.min_order_value}
                      onChange={e => setForm({ ...form, min_order_value: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Max Discount (₹)</label>
                    <input className="input" type="number" min={0} value={form.max_discount}
                      onChange={e => setForm({ ...form, max_discount: e.target.value })} />
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label>Usage Limit</label>
                  <input className="input" type="number" min={1} value={form.usage_limit}
                    onChange={e => setForm({ ...form, usage_limit: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
