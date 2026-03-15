import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Clock, Truck, CheckCircle, ChevronRight,
  User, Gift, LogOut, ShoppingBag, MapPin, Edit2, Trash2, Plus, Heart, Mail, Calendar,
  Camera, Phone, Save, X as XIcon, Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import { showToast } from '../components/ui/Toast';

const STATUS_CONFIG = {
  pending: { icon: <Clock size={14} />, color: '#f59e0b', label: 'Pending' },
  confirmed: { icon: <CheckCircle size={14} />, color: '#3b82f6', label: 'Confirmed' },
  shipped: { icon: <Truck size={14} />, color: '#8b5cf6', label: 'Shipped' },
  delivered: { icon: <CheckCircle size={14} />, color: '#10b981', label: 'Delivered' },
  returned: { icon: <Package size={14} />, color: '#ef4444', label: 'Returned' },
};

export default function AccountPage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile'); // profile | orders | addresses | referrals
  const [addresses, setAddresses] = useState([]);
  const [editingAddr, setEditingAddr] = useState(null); // null | 'new' | addr object
  const [addrForm, setAddrForm] = useState({
    full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false,
  });
  const [addrSaving, setAddrSaving] = useState(false);

  // Profile editing state
  const [profileEdit, setProfileEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Phone OTP state
  const [editPhone, setEditPhone] = useState('');
  const [phoneEditOpen, setPhoneEditOpen] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);

  const avatarInputRef = useRef(null);

  const sortAddresses = (list) => [...list].sort((a, b) => Number(b.is_default) - Number(a.is_default));

  const loadAddresses = async () => {
    const addrsData = await api.getAddresses().catch(() => ({ addresses: [] }));
    setAddresses(sortAddresses(addrsData.addresses || []));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setEditAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const openProfileEdit = () => {
    setEditName(user?.full_name || '');
    setEditAvatar(null);
    setProfileEdit(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setProfileSaving(true);
    try {
      const result = await api.updateProfile({
        full_name: editName,
        avatar: editAvatar !== null ? editAvatar : undefined,
      });
      updateUser(result);
      setProfileEdit(false);
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSendOtp = async () => {
    if (!editPhone || editPhone.replace(/\D/g, '').length < 10) {
      showToast('Enter a valid 10-digit phone number', 'error');
      return;
    }
    setOtpSending(true);
    try {
      const result = await api.sendPhoneOtp(editPhone.replace(/\D/g, ''));
      setOtpSent(true);
      if (result.otp_debug) showToast(`OTP: ${result.otp_debug}  (dev mode)`, 'success');
      else showToast('OTP sent to your phone number', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast('Enter the 6-digit OTP', 'error');
      return;
    }
    setOtpVerifying(true);
    try {
      const result = await api.verifyPhoneOtp(editPhone.replace(/\D/g, ''), otpCode);
      updateUser(result);
      setPhoneEditOpen(false);
      setOtpSent(false);
      setOtpCode('');
      setEditPhone('');
      showToast('Phone number verified and saved!', 'success');
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP', 'error');
    } finally {
      setOtpVerifying(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    Promise.all([
      api.getOrders().catch(() => ({ orders: [] })),
      api.getReferralStats().catch(() => null),
      loadAddresses(),
    ]).then(([ordersData, statsData]) => {
      setOrders(ordersData.orders || []);
      setReferralStats(statsData);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const openNewAddr = () => {
    setAddrForm({ full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false });
    setEditingAddr('new');
  };

  const openEditAddr = (addr) => {
    setAddrForm({ full_name: addr.full_name, phone: addr.phone, address_line: addr.address_line, city: addr.city, state: addr.state, pincode: addr.pincode, is_default: addr.is_default });
    setEditingAddr(addr);
  };

  const saveAddr = async () => {
    setAddrSaving(true);
    try {
      if (editingAddr === 'new') {
        await api.createAddress(addrForm);
        showToast('Address added!', 'success');
      } else {
        await api.updateAddress(editingAddr.id, addrForm);
        showToast('Address updated!', 'success');
      }
      await loadAddresses();
      setEditingAddr(null);
    } catch (err) {
      showToast(err.message || 'Failed to save address', 'error');
    } finally {
      setAddrSaving(false);
    }
  };

  const deleteAddr = async (id) => {
    try {
      await api.deleteAddress(id);
      await loadAddresses();
      showToast('Address removed', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const setDefaultAddr = async (id) => {
    try {
      await api.setDefaultAddress(id);
      await loadAddresses();
      showToast('Default address updated', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update default', 'error');
    }
  };

  const menuItems = [
    { key: 'profile', label: 'User Information', icon: <User size={16} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
    { key: 'addresses', label: 'Addresses', icon: <MapPin size={16} /> },
    { key: 'referrals', label: 'Referrals', icon: <Gift size={16} /> },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="container page-enter section">
      <div className="account-shell">
        <aside className="account-sidebar">
          <div className="account-sidebar-user">
            <div className="account-avatar-lg">
              {user.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                user.full_name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="account-sidebar-name">{user.full_name}</p>
              <p className="account-sidebar-email">{user.email}</p>
            </div>
          </div>

          <nav className="account-sidebar-menu" aria-label="Account menu">
            {menuItems.map(item => (
              <button
                key={item.key}
                className={`account-sidebar-item${tab === item.key ? ' active' : ''}`}
                onClick={() => setTab(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <button
              className="account-sidebar-item"
              onClick={() => navigate('/wishlist')}
            >
              <Heart size={16} />
              Wishlist
            </button>

            <button
              className="account-sidebar-item account-sidebar-logout"
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        </aside>

        <section className="account-content">
          {tab === 'profile' && (
            <div>
              {/* Header */}
              <div className="profile-info-row" style={{ marginBottom: 'var(--space-5)' }}>
                <h2 style={{ margin: 0 }}>Profile</h2>
                {!profileEdit ? (
                  <button className="btn btn-outline btn-sm" onClick={openProfileEdit}>
                    <Edit2 size={14} /> Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={profileSaving}>
                      <Save size={14} /> {profileSaving ? 'Saving…' : 'Save'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setProfileEdit(false)}>
                      <XIcon size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="profile-avatar-section">
                <div className="profile-avatar-lg">
                  {(editAvatar || user?.avatar) ? (
                    <img src={editAvatar || user.avatar} alt="Profile" />
                  ) : (
                    user?.full_name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                {profileEdit ? (
                  <>
                    <button className="avatar-upload-btn" onClick={() => avatarInputRef.current?.click()}>
                      <Camera size={13} /> Change Photo
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Max 2MB · JPG, PNG, WEBP</p>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{user?.full_name}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
                )}
              </div>

              {/* Editable fields or info cards */}
              {profileEdit ? (
                <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
                  <h4 style={{ marginBottom: 'var(--space-4)' }}>Edit Information</h4>
                  <div className="profile-edit-grid">
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input className="input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div className="input-group">
                      <label>Email (can't change)</label>
                      <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="account-profile-grid" style={{ marginBottom: 'var(--space-5)' }}>
                  {[
                    { label: 'Name', value: user?.full_name || '—', icon: <User size={14} /> },
                    { label: 'Email', value: user?.email || '—', icon: <Mail size={14} /> },
                    { label: 'Joined', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—', icon: <Calendar size={14} /> },
                    { label: 'Referral Code', value: user?.referral_code || '—', icon: <Gift size={14} /> },
                  ].map(card => (
                    <div key={card.label} className="card" style={{ padding: 'var(--space-5)' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                        {card.icon} {card.label}
                      </p>
                      <p style={{ fontWeight: 700, wordBreak: 'break-word' }}>{card.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Phone / OTP section */}
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
                <div className="profile-info-row">
                  <div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                      <Phone size={13} /> Phone Number
                    </p>
                    <p style={{ fontWeight: 600 }}>{user?.phone || 'Not added'}</p>
                  </div>
                  {!phoneEditOpen && (
                    <button className="btn btn-outline btn-sm" onClick={() => { setPhoneEditOpen(true); setEditPhone(user?.phone || ''); setOtpSent(false); setOtpCode(''); }}>
                      <Edit2 size={12} /> {user?.phone ? 'Change' : 'Add Phone'}
                    </button>
                  )}
                </div>

                {phoneEditOpen && (
                  <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--gray-100)', paddingTop: 'var(--space-4)' }}>
                    {!otpSent ? (
                      <>
                        <div className="input-group" style={{ marginBottom: 'var(--space-3)' }}>
                          <label>New Phone Number</label>
                          <input className="input" type="tel" placeholder="10-digit mobile number"
                            value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                          <button className="btn btn-primary" onClick={handleSendOtp} disabled={otpSending}>
                            {otpSending ? 'Sending…' : 'Send OTP'}
                          </button>
                          <button className="btn btn-ghost" onClick={() => setPhoneEditOpen(false)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                          Enter the 6-digit OTP sent to <strong>{editPhone}</strong>
                        </p>
                        <div className="otp-input-row">
                          <input className="input" placeholder="------" maxLength={6}
                            style={{ letterSpacing: 4, fontWeight: 700, textAlign: 'center' }}
                            value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} />
                          <button className="btn btn-primary" onClick={handleVerifyOtp} disabled={otpVerifying}>
                            <Check size={16} /> {otpVerifying ? 'Verifying…' : 'Verify'}
                          </button>
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)' }} onClick={() => { setOtpSent(false); setOtpCode(''); }}>
                          ← Change number
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="account-profile-stats">
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Total Orders</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{orders.length}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Saved Addresses</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{addresses.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div>
              <h2 style={{ marginBottom: 'var(--space-5)' }}>Order History</h2>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)' }} />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                  <Package size={56} style={{ color: 'var(--gray-300)', marginBottom: 'var(--space-4)' }} />
                  <h3>No orders yet</h3>
                  <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>
                    Start shopping to see your orders here!
                  </p>
                  <Link to="/products" className="btn btn-primary">Shop Now</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {orders.map(order => {
                    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={order.id} className="card" style={{
                        padding: 'var(--space-5)', cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                          <div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginBottom: 'var(--space-1)' }}>
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p style={{ fontWeight: 600 }}>
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '4px 10px', borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--text-xs)', fontWeight: 600,
                              background: `${status.color}15`, color: status.color,
                            }}>
                              {status.icon} {status.label}
                            </span>
                            <ChevronRight size={16} style={{ color: 'var(--gray-400)' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {order.items?.slice(0, 3).map((item, i) => (
                              <div key={i} style={{
                                width: 40, height: 50, borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden', background: 'var(--sky-light)',
                              }}>
                                <img src={item.image || '/bunkins-logo.png'} alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                            {(order.items?.length || 0) > 3 && (
                              <div style={{
                                width: 40, height: 50, borderRadius: 'var(--radius-sm)',
                                background: 'var(--gray-100)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 'var(--text-xs)', color: 'var(--gray-500)',
                              }}>
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                            ₹{order.total_amount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {tab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ margin: 0 }}>Saved Addresses</h2>
                <button className="btn btn-primary btn-sm" onClick={openNewAddr}>
                  <Plus size={14} /> Add New
                </button>
              </div>

              {editingAddr !== null && (
                <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', border: '2px solid var(--mint)' }}>
                  <h4 style={{ marginBottom: 'var(--space-4)' }}>{editingAddr === 'new' ? 'New Address' : 'Edit Address'}</h4>
                  <div className="account-address-form-grid" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input className="input" placeholder="Recipient name" value={addrForm.full_name}
                        onChange={e => setAddrForm(f => ({ ...f, full_name: e.target.value }))} />
                    </div>
                    <div className="input-group">
                      <label>Phone *</label>
                      <input className="input" type="tel" placeholder="10-digit mobile" value={addrForm.phone}
                        onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label>Street Address *</label>
                    <input className="input" placeholder="House no., Street, Area" value={addrForm.address_line}
                      onChange={e => setAddrForm(f => ({ ...f, address_line: e.target.value }))} />
                  </div>
                  <div className="account-address-form-grid" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="input-group">
                      <label>City *</label>
                      <input className="input" placeholder="City" value={addrForm.city}
                        onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} />
                    </div>
                    <div className="input-group">
                      <label>State *</label>
                      <input className="input" placeholder="State" value={addrForm.state}
                        onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} />
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label>PIN Code *</label>
                    <input className="input" placeholder="6-digit PIN code" value={addrForm.pincode}
                      onChange={e => setAddrForm(f => ({ ...f, pincode: e.target.value }))} maxLength={6} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                    <input type="checkbox" checked={addrForm.is_default}
                      onChange={e => setAddrForm(f => ({ ...f, is_default: e.target.checked }))} />
                    Set as default address
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary" onClick={saveAddr} disabled={addrSaving}>
                      {addrSaving ? 'Saving...' : 'Save Address'}
                    </button>
                    <button className="btn btn-outline" onClick={() => setEditingAddr(null)}>Cancel</button>
                  </div>
                </div>
              )}

              {addresses.length === 0 && editingAddr === null ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                  <MapPin size={48} style={{ color: 'var(--gray-300)', marginBottom: 'var(--space-4)' }} />
                  <h3>No saved addresses</h3>
                  <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>Add an address to speed up checkout!</p>
                  <button className="btn btn-primary" onClick={openNewAddr}><Plus size={16} /> Add Address</button>
                </div>
              ) : (
                <div className="account-addresses-grid">
                  {addresses.map(addr => (
                    <div key={addr.id} className={`card address-card${addr.is_default ? ' default' : ''}`} style={{ padding: 'var(--space-5)' }}>
                      {addr.is_default && (
                        <span className="address-default-badge" style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}>Default</span>
                      )}
                      <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{addr.full_name}</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-1)' }}>{addr.phone}</p>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                        {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {!addr.is_default && (
                          <button className="btn btn-outline btn-sm" onClick={() => setDefaultAddr(addr.id)}>
                            Set Default
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={() => openEditAddr(addr)}>
                          <Edit2 size={13} /> Edit
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteAddr(addr.id)}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Referrals Tab */}
          {tab === 'referrals' && (
            <div>
              <h2 style={{ marginBottom: 'var(--space-5)' }}>Referrals</h2>
              {referralStats ? (
                <>
                  <div className="resp-referral-stats" style={{ marginBottom: 'var(--space-8)' }}>
                    {[
                      { label: 'Total Referrals', value: referralStats.total_referrals, color: 'var(--text-on-dark)' },
                      { label: 'Successful', value: referralStats.successful_referrals, color: 'var(--mint-dark)' },
                      { label: 'Total Earned', value: `₹${referralStats.total_earned}`, color: 'var(--coral)' },
                    ].map(stat => (
                      <div key={stat.label} className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                        <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: stat.color, marginBottom: 'var(--space-1)' }}>
                          {stat.value}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="card light-accent-card" style={{
                    padding: 'var(--space-6)',
                    background: 'var(--sky-light)',
                    border: '2px solid var(--sky)',
                  }}>
                    <h3 style={{ marginBottom: 'var(--space-3)' }}>
                      <Gift size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                      Your Referral Code
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                      Share this code with friends. You both earn ₹{referralStats.reward_per_referral} on their first order!
                    </p>
                    <div className="referral-code-box" style={{
                      padding: 'var(--space-4)',
                      background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)',
                      fontWeight: 700, fontFamily: 'monospace', fontSize: 'var(--text-2xl)',
                      textAlign: 'center', letterSpacing: 3,
                      border: '2px dashed var(--mint)',
                      marginBottom: 'var(--space-4)',
                    }}>
                      {referralStats.referral_code}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }}
                      onClick={() => {
                        navigator.clipboard.writeText(referralStats.referral_code);
                        showToast('Referral code copied!', 'success');
                      }}>
                      Copy & Share
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                  <Gift size={56} style={{ color: 'var(--gray-300)', marginBottom: 'var(--space-4)' }} />
                  <h3>Referral program loading...</h3>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
