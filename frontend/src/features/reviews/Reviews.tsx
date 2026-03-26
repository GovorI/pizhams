import { useState, useEffect } from 'react';
import { Card, Button, Form, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  isApproved: boolean;
  adminResponse?: string | null;
  adminResponseDate?: string | null;
}

interface ReviewsProps {
  productId: string;
}

export function Reviews({ productId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/product/${productId}`);
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/average/${productId}`);
      const data = await response.json();
      setAverageRating(parseFloat(data));
    } catch (err) {
      console.error('Failed to fetch average rating:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    console.log('Submitting review:', { productId, rating, comment });

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Необходимо авторизоваться для создания отзыва');
      }

      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit review');
      }

      // Показываем toast уведомление вместо Alert в форме
      toast.success(
        'Спасибо за отзыв! Он появится на сайте после модерации.',
        {
          duration: 5000,
          position: 'top-right',
        }
      );

      setShowForm(false);
      setRating(5);
      setComment('');
      fetchReviews();
      fetchAverageRating();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: number = 20) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rating ? '#fbbf24' : 'none'}
            color={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Загрузка отзывов...</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <h3 className="mb-4">Отзывы и рейтинги</h3>

      {/* Average Rating */}
      <Card className="mb-4 bg-light border-0">
        <Card.Body className="text-center">
          <h2 className="mb-2">{averageRating.toFixed(1)}</h2>
          <div className="mb-2 d-flex justify-content-center">
            {renderStars(Math.round(averageRating), 30)}
          </div>
          <p className="text-muted mb-0">{reviews.length} отзывов</p>
        </Card.Body>
      </Card>

      {/* Write Review Button */}
      {!localStorage.getItem('token') ? (
        <Alert variant="info" className="mb-4">
          🔐 <strong>Войдите</strong>, чтобы оставить отзыв.{' '}
          <a href="/login">Войти</a> или <a href="/register">Зарегистрироваться</a>
        </Alert>
      ) : (
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="mb-4"
        >
          ✍️ Написать отзыв
        </Button>
      )}

      {/* Write Review Form */}
      {showForm && (
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Рейтинг</Form.Label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        transform: star <= rating ? 'scale(1.1)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = star <= rating ? 'scale(1.1)' : 'scale(1)';
                      }}
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill={star <= rating ? '#fbbf24' : 'none'}
                        stroke={star <= rating ? '#fbbf24' : '#d1d5db'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-muted">
                  Выбрано звёзд: {rating}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Комментарий</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Поделитесь своим мнением о товаре..."
                />
              </Form.Group>

              {error && <Alert variant="danger">{error}</Alert>}

              <Button
                type="submit"
                variant="primary"
                disabled={submitting || !comment.trim()}
              >
                {submitting ? 'Отправка...' : 'Отправить отзыв'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="ms-2"
              >
                Отмена
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Reviews List */}
      <Row>
        {reviews.length === 0 ? (
          <Col>
            <p className="text-muted text-center">
              Пока нет отзывов. Будьте первым!
            </p>
          </Col>
        ) : (
          reviews.map((review) => (
            <Col md={6} key={review.id} className="mb-3">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong>{review.userName || 'Аноним'}</strong>
                      <div className="mb-1">{renderStars(review.rating, 18)}</div>
                    </div>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </small>
                  </div>
                  {review.comment && <p className="mb-0">{review.comment}</p>}
                  
                  {/* Admin Response */}
                  {review.adminResponse && (
                    <div
                      className="mt-3 p-3"
                      style={{
                        background: 'var(--background)',
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--primary)',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg="primary">Ответ администрации</Badge>
                        {review.adminResponseDate && (
                          <small className="text-muted">
                            {new Date(review.adminResponseDate).toLocaleDateString('ru-RU')}
                          </small>
                        )}
                      </div>
                      <p className="mb-0" style={{ fontSize: '14px' }}>
                        {review.adminResponse}
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
}
