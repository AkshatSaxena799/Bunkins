import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Leaf, Flower2, Scissors, Globe2, Tag } from 'lucide-react';
import VectorLandscape from '../ui/VectorLandscape';
import api from '../../api/client';
import { showToast } from '../ui/Toast';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

const XLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const [nlEmail, setNlEmail] = useState('');
  const [nlSending, setNlSending] = useState(false);
  const { theme } = useTimeTheme();
  const n = theme === 'night';

  const tc = {
    sky: n ? '#1a2d4a' : '#81cee6',
    dark: n ? '#0a1628' : '#0c2a52',
    cardBg: n ? '#1e2d4a' : '#ffffff',
    cardTitle: n ? '#fef3c7' : '#073763',
    cardSub: n ? '#94a3b8' : '#3b297a',
    inputBg: n ? 'rgba(30,45,74,0.8)' : '#f5f7fb',
    inputBorder: n ? 'rgba(100,130,180,0.3)' : '#e1e7f3',
    inputColor: n ? '#fef3c7' : '#073763',
    linkColor: n ? 'rgba(200,210,230,0.75)' : 'rgba(255,255,255,0.75)',
    headColor: n ? '#fef3c7' : '#ffffff',
    boxText: n ? '#e8dcc8' : '#333',
    boxSub: n ? '#94a3b8' : '#555',
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!nlEmail) return;
    setNlSending(true);
    try {
      const res = await api.subscribeNewsletter(nlEmail);
      if (res.success) {
        showToast('Subscribed! Check your email for your 10% off code.', 'success');
        setNlEmail('');
      }
    } catch (err) {
      showToast('Error subscribing. Try again.', 'error');
    } finally {
      setNlSending(false);
    }
  };

  return (
    <footer style={{ position: 'relative', width: '100%' }}>
      <style>{`
        .bunkins-feature-box {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }
        .bunkins-feature-box:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
        }
      `}</style>

      {/* Sky wave separator */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, backgroundColor: 'transparent', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: 'block', height: '60px', width: '100%' }}>
          <path fill={tc.sky} d="M0,60 C360,100 1080,20 1440,60 L1440,120 L0,120 Z"></path>
        </svg>
      </div>

      {/* Feature Boxes */}
      <div style={{
        position: 'relative', width: '100%',
        backgroundColor: tc.sky,
        paddingTop: '0px', paddingBottom: '20px',
        display: 'flex', justifyContent: 'center',
        marginTop: '-1px',
        transition: 'background-color 0.6s ease',
      }}>
        <div className="resp-footer-feature-grid" style={{ zIndex: 10 }}>
          <div className="bunkins-feature-box" style={{ background: n ? '#804050' : '#ff9fa8', borderRadius: '32px', padding: '40px 16px', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 70, height: 70, background: n ? 'rgba(255,255,255,0.15)' : '#ffffff', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flower2 size={32} color={n ? '#fef3c7' : '#444'} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: tc.boxText, marginBottom: '8px' }}>Organic Fabrics</h3>
            <p style={{ fontSize: '13px', color: tc.boxSub, lineHeight: '1.4' }}>Organic fabrics and<br/>cotton plants</p>
          </div>

          <div className="bunkins-feature-box" style={{ background: n ? '#3a5a7a' : '#90b8e0', borderRadius: '32px', padding: '40px 16px', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 70, height: 70, background: n ? 'rgba(255,255,255,0.15)' : '#ffffff', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scissors size={32} color={n ? '#fef3c7' : '#444'} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: tc.boxText, marginBottom: '8px' }}>Handcrafted Quality</h3>
            <p style={{ fontSize: '13px', color: tc.boxSub, lineHeight: '1.4' }}>Handcrafted Quality,<br/>needle & thread</p>
          </div>

          <div className="bunkins-feature-box" style={{ background: n ? '#8a7030' : '#ffd96b', borderRadius: '32px', padding: '40px 16px', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 70, height: 70, background: n ? 'rgba(255,255,255,0.15)' : '#ffffff', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe2 size={32} color={n ? '#fef3c7' : '#444'} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: tc.boxText, marginBottom: '8px' }}>Eco-Friendly</h3>
            <p style={{ fontSize: '13px', color: tc.boxSub, lineHeight: '1.4' }}>Eco-friendly, Leaf and<br/>green eco-friendly</p>
          </div>

          <div className="bunkins-feature-box" style={{ background: n ? '#4a6a30' : '#96c86b', borderRadius: '32px', padding: '40px 16px', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 70, height: 70, background: n ? 'rgba(255,255,255,0.15)' : '#ffffff', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={32} color={n ? '#fef3c7' : '#444'} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: tc.boxText, marginBottom: '8px' }}>100% Cotton</h3>
            <p style={{ fontSize: '13px', color: tc.boxSub, lineHeight: '1.4' }}>100% cotton Label.,<br/>maas natural alabe</p>
          </div>
        </div>
      </div>

      {/* Vector Landscape & Newsletter */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <div className="resp-footer-newsletter-wrap" style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <VectorLandscape />

          <div className="resp-footer-newsletter-card" style={{ position: 'relative', width: '100%', pointerEvents: 'auto', zIndex: 12 }}>
            <div style={{
              background: tc.cardBg,
              borderRadius: '24px', padding: '48px',
              boxShadow: n ? '0 10px 40px rgba(0,0,0,0.4)' : '0 10px 40px rgba(0,0,0,0.15)',
              textAlign: 'center', lineHeight: 1.5,
              border: n ? '1px solid rgba(100,130,180,0.2)' : 'none',
              transition: 'background 0.6s ease, box-shadow 0.4s ease',
            }}>
              <Leaf size={28} color={tc.cardTitle} style={{ margin: '0 auto 20px', display: 'block' }} />
              <h2 style={{ fontSize: '26px', fontWeight: 700, color: tc.cardTitle, marginBottom: '10px' }}>JOIN OUR JOURNEY!</h2>
              <p style={{ fontSize: '15px', color: tc.cardSub, marginBottom: '24px' }}>Stay inspired with new arrivals & exclusive offers.</p>
              <form onSubmit={handleNewsletter} className="resp-footer-newsletter-form" style={{ gap: '8px' }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={nlEmail}
                  onChange={e => setNlEmail(e.target.value)}
                  required
                  style={{
                    background: tc.inputBg, border: `1px solid ${tc.inputBorder}`,
                    borderRadius: '30px', padding: '16px 24px', width: '100%',
                    color: tc.inputColor, outline: 'none', boxSizing: 'border-box',
                    transition: 'background 0.4s ease, border-color 0.4s ease',
                  }}
                />
                <button type="submit" disabled={nlSending} className="btn btn-primary" style={{
                  borderRadius: '30px', padding: 'var(--space-4) var(--space-8)', flexShrink: 0,
                }}>
                  {nlSending ? '...' : 'SUBSCRIBE'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Navy wave */}
        <div style={{ width: '100%', position: 'absolute', bottom: -1, left: 0, zIndex: 11, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: 'block', height: '140px', width: '100%' }}>
            <path fill={tc.dark} d="M0,80 C480,180 960,-20 1440,60 L1440,121 L0,121 Z"></path>
          </svg>
        </div>
      </div>

      {/* Dark Footer Navigation */}
      <div style={{
        backgroundColor: tc.dark, padding: '0 24px 64px 24px',
        position: 'relative', zIndex: 10,
        transition: 'background-color 0.6s ease',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="resp-footer-main-grid">
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', color: tc.headColor, marginBottom: '24px' }}>CUSTOMER CARE</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li><Link to="/page/faq" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>FAQ</Link></li>
                <li><Link to="/page/shipping" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Shipping</Link></li>
                <li><Link to="/page/returns" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Returns</Link></li>
                <li><Link to="/page/size-guide" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Size Guide</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', color: tc.headColor, marginBottom: '24px' }}>OUR STORY</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li><Link to="/page/about" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>About Us</Link></li>
                <li><Link to="/page/sustainability" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Sustainability</Link></li>
                <li><Link to="/page/journal" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Journal</Link></li>
                <li><Link to="/page/press" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Press</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1px', color: tc.headColor, marginBottom: '24px' }}>QUICK LINKS</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li><Link to="/products" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Shop</Link></li>
                <li><Link to="/products/gift-cards" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Gift Cards</Link></li>
                <li><Link to="/products?sort=bestsellers" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Bestsellers</Link></li>
                <li><Link to="/contact" style={{ fontSize: '14px', color: tc.linkColor, textDecoration: 'none' }}>Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Icons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center' }}>
            <a href="https://www.instagram.com/bunkinsofficial/" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc.dark, textDecoration: 'none', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.5)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61582617388500" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc.dark, textDecoration: 'none', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.5)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <Facebook size={20} />
            </a>
            <a href="https://x.com/BunkinsOfficial" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc.dark, textDecoration: 'none', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(255,255,255,0.5)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <XLogo size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
