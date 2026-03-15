import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, FileText,
  ArrowLeft, LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Overview', exact: true },
  { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/coupons', icon: <Tag size={18} />, label: 'Coupons' },
  { to: '/admin/cms', icon: <FileText size={18} />, label: 'Pages (CMS)' },
];

export default function DashboardLayout() {
  const { user, isOwner, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOwner) navigate('/');
  }, [isOwner, navigate]);

  if (!isOwner) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/">
            <img src="/bunkins-logo.png" alt="Bunkins" style={{ height: 36 }} />
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`admin-nav-item ${active ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <ArrowLeft size={18} />
            <span>Back to Store</span>
          </Link>
          <button className="admin-nav-item" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
