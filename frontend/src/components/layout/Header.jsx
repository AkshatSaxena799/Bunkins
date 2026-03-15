import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search, Sun, Moon, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

export default function Header({ onAuthClick }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTimeTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop All' },
    { to: '/products?gender=boys', label: 'Boys' },
    { to: '/products?gender=girls', label: 'Girls' },
    { to: '/products?featured=true', label: 'New Arrivals' },
  ];

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.search]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setProfileOpen(p => !p);
    } else {
      onAuthClick?.();
    }
  };

  const isActiveLink = (to) => {
    if (to === '/') return location.pathname === '/';

    const [path, query = ''] = to.split('?');
    if (location.pathname !== path) return false;

    if (!query) return true;
    return location.search === `?${query}`;
  };

  return (
    <>
      <header className="header">
        <div className="container resp-header-shell">

          {/* LEFT: Theme toggle + Hamburger */}
          <div className="resp-header-left">
            <button
              className="header-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
            >
              {theme === 'day' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button
              className="menu-toggle header-icon-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Desktop nav */}
            <nav className="header-nav">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={isActiveLink(link.to) ? 'active' : ''}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CENTER: Logo */}
          <Link to="/" className="resp-header-logo" aria-label="Bunkins home">
            <img src="/bunkins-logo.png" alt="Bunkins" loading="eager" width={120} height={120} />
          </Link>

          {/* RIGHT: Search + Wishlist (desktop) + Cart + Profile */}
          <div className="resp-header-right">
            <Link
              to="/search"
              className="header-icon-btn"
              aria-label="Search"
              style={{ color: 'var(--white)', textDecoration: 'none' }}
            >
              <Search size={18} />
            </Link>

            <Link
              to="/wishlist"
              className="header-icon-btn header-desktop-only"
              aria-label="Wishlist"
              style={{ color: 'var(--white)', position: 'relative', textDecoration: 'none' }}
            >
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="header-badge">{wishlistCount}</span>
              )}
            </Link>

            <Link
              to="/cart"
              className="header-icon-btn header-cart-btn"
              aria-label={`Cart, ${totalItems} items`}
              style={{ color: 'var(--white)', position: 'relative', textDecoration: 'none' }}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="header-badge header-cart-badge">{totalItems}</span>
              )}
            </Link>

            {/* Admin pill (desktop only) */}
            {isAuthenticated && user?.role === 'owner' && (
              <Link
                to="/admin"
                className="btn btn-sm header-desktop-only"
                style={{
                  background: 'rgba(206,231,245,0.85)', color: '#073763',
                  fontSize: 'var(--text-xs)', padding: '6px 12px',
                  borderRadius: 'var(--radius-full)', textDecoration: 'none'
                }}
              >
                Admin
              </Link>
            )}

            {/* Profile icon + dropdown */}
            <div className="header-profile-wrap" ref={profileRef}>
              <button
                className="header-icon-btn header-profile-btn"
                onClick={handleProfileClick}
                aria-label={isAuthenticated ? 'Account menu' : 'Sign in'}
                aria-expanded={profileOpen}
              >
                {isAuthenticated ? (
                  <span className="header-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="header-avatar-image" />
                    ) : (
                      user.full_name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </span>
                ) : (
                  <User size={20} />
                )}
              </button>

              {/* Dropdown */}
              {profileOpen && isAuthenticated && (
                <div className="header-profile-dropdown">
                  <div className="header-profile-dropdown-header">
                    <p className="header-profile-name">{user.full_name}</p>
                    <p className="header-profile-email">{user.email}</p>
                  </div>
                  <div className="header-profile-dropdown-menu">
                    <Link
                      to="/account"
                      className="header-profile-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={15} /> Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      className="header-profile-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Heart size={15} />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="header-profile-badge">{wishlistCount}</span>
                      )}
                    </Link>
                    <button
                      className="header-profile-item header-profile-logout"
                      onClick={() => { setProfileOpen(false); logout(); }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <button
            className="mobile-nav-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <nav className="mobile-nav open" aria-label="Mobile navigation">
            <div className="mobile-nav-panel">
              <div className="mobile-nav-topbar">
                <div>
                  <p className="mobile-nav-kicker">Bunkins</p>
                  <h3 style={{ fontSize: '1.2rem', lineHeight: 1.15 }}>
                    {isAuthenticated ? `Hi, ${user?.full_name?.split(' ')[0] || 'there'} 👋` : 'Explore the collection'}
                  </h3>
                </div>
                <button
                  className="close-btn header-action-btn"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Nav Categories */}
              <div className="mobile-nav-group">
                <p className="mobile-nav-section-label">Shop</p>
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="mobile-nav-primary-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Account links at bottom */}
              <div className="mobile-nav-group mobile-nav-secondary">
                {isAuthenticated ? (
                  <>
                    <Link to="/account" className="mobile-nav-secondary-link" onClick={() => setMobileOpen(false)}>
                      <span className="mobile-nav-secondary-label"><User size={16} />My Profile</span>
                    </Link>
                    {user?.role === 'owner' && (
                      <Link to="/admin" className="mobile-nav-secondary-link" onClick={() => setMobileOpen(false)}>
                        <span className="mobile-nav-secondary-label"><Settings size={16} />Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      className="mobile-nav-secondary-link mobile-nav-secondary-button mobile-nav-logout"
                      onClick={() => { setMobileOpen(false); logout(); }}
                    >
                      <span className="mobile-nav-secondary-label"><LogOut size={16} />Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="mobile-nav-secondary-link mobile-nav-secondary-button"
                    onClick={() => { setMobileOpen(false); onAuthClick?.(); }}
                  >
                    <span className="mobile-nav-secondary-label"><User size={16} />Sign In / Register</span>
                  </button>
                )}
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
