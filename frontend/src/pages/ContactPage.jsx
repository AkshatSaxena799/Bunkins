import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { showToast } from '../components/ui/Toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    showToast('Message sent! We\'ll get back to you within 24 hours.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  return (
    <div className="container page-enter section">
      <div className="section-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Reach out with questions, feedback, or just to say hi.</p>
      </div>

      <div className="resp-contact-grid">
        {/* Contact Form */}
        <div className="card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ marginBottom: 'var(--space-6)', color: 'var(--text-on-dark)' }}>Send a Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Name *</label>
              <input className="input" placeholder="Your name" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Email *</label>
              <input className="input" type="email" placeholder="your@email.com" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Subject</label>
              <input className="input" placeholder="What's this about?" value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label>Message *</label>
              <textarea className="input" rows={5} placeholder="Tell us more..." required value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={sending}>
              {sending ? 'Sending...' : <><Send size={16} /> Send Message</>}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {[
            {
              icon: <Mail size={24} />, title: 'Email Us',
              detail: 'hello@bunkins.com',
              sub: 'We respond within 24 hours',
            },
            {
              icon: <Phone size={24} />, title: 'Call Us',
              detail: '+91 98765 43210',
              sub: 'Mon-Sat, 10am-6pm IST',
            },
            {
              icon: <MapPin size={24} />, title: 'Visit Us',
              detail: 'Bunkins HQ, Mumbai, India',
              sub: 'By appointment only',
            },
            {
              icon: <Clock size={24} />, title: 'Business Hours',
              detail: 'Mon-Sat: 10:00 AM - 6:00 PM',
              sub: 'Sunday: Closed',
            },
          ].map(info => (
            <div key={info.title} className="card" style={{
              padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.2)', color: 'var(--text-on-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {info.icon}
              </div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 2, color: 'var(--text-on-dark)' }}>{info.title}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-on-dark)', opacity: 0.9 }}>{info.detail}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-on-dark)', opacity: 0.8 }}>{info.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
