import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AuthModal from '../auth/AuthModal';
import Toast from '../ui/Toast';
import NightStars from '../ui/NightStars';
import WelcomePopup from '../ui/WelcomePopup';

export default function Layout() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <NightStars />
      <Header onAuthClick={() => setShowAuth(true)} />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet context={{ openAuth: () => setShowAuth(true) }} />
      </main>
      <Footer />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <WelcomePopup />
      <Toast />
    </div>
  );
}
