import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import api from '../../api/client';
import { showToast } from '../../components/ui/Toast';

export default function CmsEditor() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '', meta_description: '', published: true });
  const [saving, setSaving] = useState(false);

  const fetchPages = () => {
    setLoading(true);
    api.getCmsPages()
      .then(d => setPages(d.pages || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchPages, []);

  const openAdd = () => {
    setForm({ slug: '', title: '', content: '', meta_description: '', published: true });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (page) => {
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      meta_description: page.meta_description || '',
      published: page.published,
    });
    setEditingId(page.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page?')) return;
    try {
      await api.deleteCmsPage(id);
      showToast('Page deleted', 'success');
      fetchPages();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.updateCmsPage(editingId, form);
        showToast('Page updated!', 'success');
      } else {
        await api.createCmsPage(form);
        showToast('Page created!', 'success');
      }
      setShowForm(false);
      fetchPages();
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
          <h1>Pages (CMS)</h1>
          <p style={{ color: 'var(--gray-500)' }}>{pages.length} pages</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Create Page
        </button>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />)
        ) : pages.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p style={{ color: 'var(--gray-400)' }}>No pages created yet. Add pages like About, FAQ, Returns, etc.</p>
          </div>
        ) : pages.map(page => (
          <div key={page.id} className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <h4 style={{ fontSize: 'var(--text-base)' }}>{page.title}</h4>
                {page.published ? (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--mint-dark)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Eye size={12} /> Published
                  </span>
                ) : (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EyeOff size={12} /> Draft
                  </span>
                )}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>/{page.slug}</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(page)}><Pencil size={14} /></button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                onClick={() => handleDelete(page.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
          <div className="modal" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Page' : 'Create Page'}</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {!editingId && (
                  <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label>URL Slug *</label>
                    <input className="input" placeholder="e.g. about-us" value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} required />
                  </div>
                )}
                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Title *</label>
                  <input className="input" placeholder="Page title" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Content * (HTML or Markdown)</label>
                  <textarea className="input" rows={10} placeholder="Write your page content here..."
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })} required
                    style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 'var(--text-sm)' }} />
                </div>
                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label>Meta Description</label>
                  <input className="input" placeholder="SEO description" value={form.meta_description}
                    onChange={e => setForm({ ...form, meta_description: e.target.value })} />
                </div>
                <label className="checkbox-label" style={{ marginBottom: 'var(--space-6)' }}>
                  <input type="checkbox" checked={form.published}
                    onChange={e => setForm({ ...form, published: e.target.checked })} />
                  Published (visible to visitors)
                </label>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Page' : 'Create Page'}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
