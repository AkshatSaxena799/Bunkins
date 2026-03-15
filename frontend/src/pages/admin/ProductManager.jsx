import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import api from '../../api/client';
import { showToast } from '../../components/ui/Toast';

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'sets', 'accessories'];
const GENDERS = ['boys', 'girls', 'unisex'];
const AGE_GROUPS = ['0-2', '2-4', '4-6', '6-8', '8-10'];

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', category: 'tops',
  gender: 'unisex', age_group: '2-4', images: [''],
  sizes: [{ size: '2-3Y', stock: 10 }, { size: '3-4Y', stock: 10 }, { size: '4-5Y', stock: 10 }],
  tags: [], featured: false,
};

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api.getProducts({ page_size: 100 })
      .then(d => setProducts(d.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, []);

  const openAdd = () => {
    setForm({ ...EMPTY_PRODUCT });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      gender: product.gender,
      age_group: product.age_group,
      images: product.images?.length ? product.images : [''],
      sizes: product.sizes || [],
      tags: product.tags || [],
      featured: product.featured || false,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        images: form.images.filter(i => i.trim()),
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()) : form.tags,
      };

      if (editingId) {
        await api.updateProduct(editingId, data);
        showToast('Product updated!', 'success');
      } else {
        await api.createProduct(data);
        showToast('Product created!', 'success');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p style={{ color: 'var(--gray-500)' }}>{products.length} products</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-6)', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        <input className="input" placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 42 }}
        />
      </div>

      {/* Product Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Gender</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i}><td colSpan={6}><div className="skeleton" style={{ height: 20 }} /></td></tr>
              ))
            ) : filtered.map(product => (
              <tr key={product.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: 40, height: 50, borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden', background: 'var(--sky-light)', flexShrink: 0,
                    }}>
                      <img src={product.images?.[0] || '/bunkins-logo.png'} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontWeight: 500 }}>{product.name}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td style={{ fontWeight: 600 }}>₹{product.price?.toLocaleString('en-IN')}</td>
                <td style={{ textTransform: 'capitalize' }}>{product.gender}</td>
                <td>{product.featured ? '⭐' : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(product)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                      onClick={() => handleDelete(product.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Name *</label>
                  <input className="input" value={form.name} required
                    onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Description</label>
                  <textarea className="input" rows={3} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    style={{ resize: 'vertical' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label>Price (₹) *</label>
                    <input className="input" type="number" value={form.price} required min={0}
                      onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Category *</label>
                    <select className="input" value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label>Gender *</label>
                    <select className="input" value={form.gender}
                      onChange={e => setForm({ ...form, gender: e.target.value })}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Age Group *</label>
                    <select className="input" value={form.age_group}
                      onChange={e => setForm({ ...form, age_group: e.target.value })}>
                      {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Image URL</label>
                  <input className="input" placeholder="https://..." value={form.images[0] || ''}
                    onChange={e => setForm({ ...form, images: [e.target.value] })} />
                </div>

                {/* Inventory / Sizes Editor */}
                <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <label style={{ margin: 0 }}>Inventory (Sizes & Stock)</label>
                    <button type="button" className="btn btn-sm btn-ghost" 
                      onClick={() => setForm({ ...form, sizes: [...form.sizes, { size: '', stock: 0 }] })}>
                      <Plus size={14} /> Add Size
                    </button>
                  </div>
                  
                  {form.sizes.map((sz, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <input className="input" placeholder="Size (e.g. 2-3Y)" value={sz.size}
                        style={{ flex: 1 }}
                        onChange={e => {
                          const newSizes = [...form.sizes];
                          newSizes[idx] = { ...sz, size: e.target.value };
                          setForm({ ...form, sizes: newSizes });
                        }} required />
                      <input className="input" type="number" placeholder="Stock" value={sz.stock}
                        style={{ width: 100 }} min={0}
                        onChange={e => {
                          const newSizes = [...form.sizes];
                          newSizes[idx] = { ...sz, stock: parseInt(e.target.value) || 0 };
                          setForm({ ...form, sizes: newSizes });
                        }} required />
                      <button type="button" className="btn btn-icon btn-ghost" style={{ color: 'var(--red)' }}
                        onClick={() => {
                          const newSizes = form.sizes.filter((_, i) => i !== idx);
                          setForm({ ...form, sizes: newSizes });
                        }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {form.sizes.length === 0 && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
                      Add at least one size to make this product available for purchase.
                    </p>
                  )}
                </div>

                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Tags (comma-separated)</label>
                  <input className="input" placeholder="organic, bestseller, cotton"
                    value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>

                <label className="checkbox-label" style={{ marginBottom: 'var(--space-6)' }}>
                  <input type="checkbox" checked={form.featured}
                    onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  Featured product (shows on homepage)
                </label>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
