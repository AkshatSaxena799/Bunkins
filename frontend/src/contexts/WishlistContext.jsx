import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const LOCAL_KEY = 'bunkins_wishlist';

function loadLocalWishlist() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [productIds, setProductIds] = useState(loadLocalWishlist);
  const [products, setProducts] = useState([]);

  // Sync from server when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.getWishlist()
        .then(data => {
          setProductIds(data.product_ids || []);
          setProducts(data.products || []);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(productIds));
    }
  }, [productIds, isAuthenticated]);

  const toggleWishlist = useCallback(async (productId) => {
    const isInList = productIds.includes(productId);

    if (isAuthenticated) {
      try {
        if (isInList) {
          const result = await api.removeFromWishlist(productId);
          setProductIds(result.product_ids);
        } else {
          const result = await api.addToWishlist(productId);
          setProductIds(result.product_ids);
        }
      } catch (err) {
        console.error('Wishlist error:', err);
      }
    } else {
      // Guest mode — local only
      if (isInList) {
        setProductIds(prev => prev.filter(id => id !== productId));
      } else {
        setProductIds(prev => [...prev, productId]);
      }
    }
  }, [productIds, isAuthenticated]);

  const isInWishlist = useCallback(
    (productId) => productIds.includes(productId),
    [productIds]
  );

  const value = {
    productIds,
    products,
    toggleWishlist,
    isInWishlist,
    count: productIds.length,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
