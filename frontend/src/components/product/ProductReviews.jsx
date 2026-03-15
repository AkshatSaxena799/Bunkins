import { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { showToast } from '../ui/Toast';

function StarRating({ rating, onRate, interactive = false, size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            color: star <= rating ? '#f59e0b' : 'var(--text-muted)',
            fill: star <= rating ? '#f59e0b' : 'none',
            transition: 'all 0.15s ease',
          }}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={interactive ? (e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
          } : undefined}
          onMouseLeave={interactive ? (e) => {
            e.currentTarget.style.transform = 'scale(1)';
          } : undefined}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = () => {
    api.getReviews(productId)
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.average_rating || 0);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchReviews, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createReview({
        product_id: productId,
        rating: newRating,
        title,
        comment,
      });
      showToast('Review submitted! Thank you 💛', 'success');
      setShowForm(false);
      setTitle('');
      setComment('');
      setNewRating(5);
      fetchReviews();
    } catch (err) {
      showToast(err.message || 'Could not submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-section" style={{ marginTop: 'var(--space-10)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h3 style={{ marginBottom: 'var(--space-1)' }}>Customer Reviews</h3>
          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <StarRating rating={Math.round(avgRating)} />
              <span style={{ fontWeight: 600 }}>{avgRating}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                ({total} review{total !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        {isAuthenticated && !showForm && (
          <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}>
            Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && (
        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                Rating *
              </label>
              <StarRating rating={newRating} onRate={setNewRating} interactive size={28} />
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Title</label>
              <input className="input" placeholder="Sum it up in a few words" value={title}
                onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label>Your Review</label>
              <textarea className="input" rows={3} placeholder="Tell others what you think..."
                value={comment} onChange={e => setComment(e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : <><Send size={14} /> Submit Review</>}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div>
          {[1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
          <p>No reviews yet. {isAuthenticated ? 'Be the first to review!' : 'Sign in to leave a review.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reviews.map(review => (
            <div key={review.id} style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-100)',
              background: 'var(--white)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 'var(--radius-full)',
                      background: 'var(--sky-light)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--navy)',
                    }}>
                      <User size={14} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{review.user_name}</span>
                  </div>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {review.title && (
                <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>{review.title}</p>
              )}
              {review.comment && (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
