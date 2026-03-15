import { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, Users, Package, DollarSign,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import api from '../../api/client';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <h1>Dashboard</h1>
        <div className="admin-stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: <DollarSign size={20} />,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: <ShoppingBag size={20} />,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Products',
      value: stats?.total_products || 0,
      icon: <Package size={20} />,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
      label: 'Customers',
      value: stats?.total_users || 0,
      icon: <Users size={20} />,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--gray-500)' }}>Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {statCards.map(card => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <p className="admin-stat-label">{card.label}</p>
              <p className="admin-stat-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders by Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
        <div className="admin-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Orders by Status</h3>
          {['pending', 'confirmed', 'shipped', 'delivered', 'returned'].map(status => {
            const count = stats?.orders_by_status?.[status] || 0;
            const colors = {
              pending: '#f59e0b', confirmed: '#3b82f6',
              shipped: '#8b5cf6', delivered: '#10b981', returned: '#ef4444',
            };
            return (
              <div key={status} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3) 0', borderBottom: '1px solid var(--gray-100)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[status] }} />
                  <span style={{ textTransform: 'capitalize', fontSize: 'var(--text-sm)' }}>{status}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Top Products</h3>
          {stats?.top_products?.length > 0 ? (
            stats.top_products.map((p, i) => (
              <div key={p._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 'var(--space-3) 0', borderBottom: '1px solid var(--gray-100)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-full)',
                    background: 'var(--sky-light)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 700,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  {p.total_sold} sold
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>No data yet</p>
          )}
        </div>
      </div>

      {/* Revenue Chart (Simple bar) */}
      {stats?.daily_stats?.length > 0 && (
        <div className="admin-card" style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>
            <TrendingUp size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Revenue (Last 7 Days)
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', height: 160 }}>
            {stats.daily_stats.map(day => {
              const maxRev = Math.max(...stats.daily_stats.map(d => d.revenue));
              const height = maxRev > 0 ? (day.revenue / maxRev) * 140 : 10;
              return (
                <div key={day._id} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height, background: 'linear-gradient(to top, var(--mint-dark), var(--mint))',
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      transition: 'height 0.5s ease', minHeight: 4,
                    }}
                    title={`₹${day.revenue.toLocaleString('en-IN')}`}
                  />
                  <p style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
                    {day._id.slice(5)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="admin-card" style={{ marginTop: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Recent Orders</h3>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_orders?.map(order => (
                <tr key={order.id}>
                  <td>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td>
                    <span className={`admin-status admin-status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{order.total_amount?.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
