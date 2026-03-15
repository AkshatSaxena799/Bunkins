import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/product/ProductCard';
import { useTimeTheme } from '../contexts/TimeThemeContext';

const GENDERS = ['boys', 'girls', 'unisex'];
const CATEGORIES = ['tops', 'bottoms', 'dresses', 'sets', 'accessories'];
const AGE_GROUPS = ['0-2', '2-4', '4-6', '6-8', '8-10'];
const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name: A-Z' },
];

export default function ProductListingPage() {
  const { theme } = useTimeTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read filters from URL
  const gender = searchParams.get('gender') || '';
  const category = searchParams.get('category') || '';
  const age_group = searchParams.get('age_group') || '';
  const featured = searchParams.get('featured') || '';
  const search = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'created_at:desc';
  const page = parseInt(searchParams.get('page') || '1');

  const [sort_by, sort_order] = sortParam.split(':');

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({
        page,
        page_size: 12,
        gender: gender || undefined,
        category: category || undefined,
        age_group: age_group || undefined,
        featured: featured === 'true' ? true : undefined,
        search: search || undefined,
        sort_by,
        sort_order,
      })
      .then(data => {
        setProducts(data.products || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [gender, category, age_group, featured, search, sortParam, page]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page on filter change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = gender || category || age_group || featured || search;

  const FilterContent = () => (
    <>
      {/* Gender */}
      <div className="filter-section">
        <h4>Gender</h4>
        <div className="filter-options">
          {GENDERS.map(g => (
            <label key={g} className="checkbox-label">
              <input
                type="radio"
                name="gender"
                checked={gender === g}
                onChange={() => updateFilter('gender', gender === g ? '' : g)}
              />
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="filter-section">
        <h4>Category</h4>
        <div className="filter-options">
          {CATEGORIES.map(c => (
            <label key={c} className="checkbox-label">
              <input
                type="radio"
                name="category"
                checked={category === c}
                onChange={() => updateFilter('category', category === c ? '' : c)}
              />
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Age Group */}
      <div className="filter-section">
        <h4>Age Group</h4>
        <div className="filter-options">
          {AGE_GROUPS.map(a => (
            <label key={a} className="checkbox-label">
              <input
                type="radio"
                name="age_group"
                checked={age_group === a}
                onChange={() => updateFilter('age_group', age_group === a ? '' : a)}
              />
              {a} years
            </label>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          className="btn btn-outline btn-sm"
          style={{ width: '100%', marginTop: 'var(--space-4)' }}
          onClick={clearFilters}
        >
          Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <div
      className="page-enter"
      style={{
        minHeight: '70vh',
        background: theme === 'night'
          ? 'linear-gradient(180deg, transparent 0%, rgba(15,23,41,0.4) 30%, rgba(26,39,68,0.3) 100%)'
          : undefined,
        transition: 'background 0.5s ease',
      }}
    >
      <div className="container section">
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-400)' }}>
            <Link to="/" style={{ color: 'var(--gray-400)' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-on-surface)' }}>
              {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'All Products'}
            </span>
          </div>
          <h1>
            {featured === 'true'
              ? '✨ New Arrivals'
              : gender
              ? `${gender.charAt(0).toUpperCase() + gender.slice(1)} Collection`
              : 'All Products'}
          </h1>
        </div>

        <div className="product-listing">
          {/* Desktop Filter Sidebar */}
          <aside className="filter-sidebar">
            <div style={{
              background: 'var(--sky-light)',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              border: theme === 'night' ? '1px solid rgba(100,130,180,0.2)' : undefined,
              transition: 'background 0.5s ease, border-color 0.4s ease',
            }}>
              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)', color: 'var(--text-on-surface)' }}>
                Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="product-grid-container">
            <div className="product-grid-header resp-product-listing-header">
              <div className="results-count">
                {total} product{total !== 1 ? 's' : ''} found
              </div>
              <div className="resp-product-listing-actions">
                <button
                  className="btn btn-outline btn-sm mobile-filter-btn"
                  onClick={() => setShowMobileFilters(true)}
                  id="mobile-filter-btn"
                >
                  <SlidersHorizontal size={16} /> Filters
                </button>
                <select
                  className="sort-select"
                  value={sortParam}
                  onChange={e => updateFilter('sort', e.target.value)}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="product-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="product-card">
                    <div className="skeleton" style={{ aspectRatio: '3/4' }} />
                    <div style={{ padding: 'var(--space-4)' }}>
                      <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 20, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
                <h3 style={{ marginBottom: 'var(--space-3)' }}>No products found</h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>
                  Try adjusting your filters or browse all products
                </p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 12 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-8)',
              }}>
                {Array.from({ length: Math.ceil(total / 12) }, (_, i) => (
                  <button
                    key={i}
                    className={`btn ${page === i + 1 ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}`}
                    onClick={() => updateFilter('page', String(i + 1))}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <>
            <div
              className="filter-drawer-backdrop"
              style={{ display: 'block' }}
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="filter-drawer" style={{ display: 'block' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
              }}>
                <h3>Filters</h3>
                <button
                  className="btn btn-icon btn-ghost"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
