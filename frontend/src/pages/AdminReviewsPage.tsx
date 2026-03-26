import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks/redux';
import { Card, Container, Table, Badge, Spinner, Alert, Button, Row, Col, Form } from 'react-bootstrap';
import type { RootState } from '@app/store';

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userId: string;
  productId: string;
  isApproved: boolean;
  createdAt: string;
  adminResponse?: string | null;
  adminResponseDate?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AdminReviewsPage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchReviews();
  }, [isAuthenticated, user, navigate]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews?approved=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      setSuccess('Отзыв одобрен');
      fetchReviews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve review');
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setSuccess('Отзыв удалён');
      fetchReviews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const handleAddResponse = async (reviewId: string) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ adminResponse }),
      });

      if (!response.ok) {
        throw new Error('Failed to add response');
      }

      setSuccess('Ответ добавлен');
      setShowResponseForm(null);
      setAdminResponse('');
      fetchReviews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add response');
    }
  };

  const handleRemoveResponse = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить ответ?')) return;

    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ adminResponse: null }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove response');
      }

      setSuccess('Ответ удалён');
      fetchReviews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove response');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: star <= rating ? '#fbbf24' : '#d1d5db' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка отзывов...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">⭐ Модерация отзывов</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {reviews.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">Нет отзывов на модерации</p>
              <Button variant="primary" onClick={() => navigate('/admin')}>
                ← Вернуться в админ-панель
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Рейтинг</th>
                  <th>Товар</th>
                  <th>Пользователь</th>
                  <th>Комментарий</th>
                  <th>Ответ админа</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{renderStars(review.rating)}</td>
                    <td>
                      <Badge bg="info">{review.productId.slice(0, 8)}...</Badge>
                    </td>
                    <td>{review.userName || 'Аноним'}</td>
                    <td style={{ maxWidth: '250px' }}>
                      {review.comment || <em className="text-muted">Без комментария</em>}
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      {review.adminResponse ? (
                        <div>
                          <small className="text-muted">
                            {review.adminResponseDate
                              ? new Date(review.adminResponseDate).toLocaleDateString('ru-RU')
                              : ''}
                          </small>
                          <p className="mb-0 text-truncate" title={review.adminResponse}>
                            {review.adminResponse}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                        >
                          ✅
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(review.id)}
                        >
                          🗑️
                        </Button>
                        {review.adminResponse ? (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleRemoveResponse(review.id)}
                            title="Удалить ответ"
                          >
                            ✏️
                          </Button>
                        ) : (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowResponseForm(review.id)}
                            title="Ответить"
                          >
                            💬
                          </Button>
                        )}
                      </div>
                      {showResponseForm === review.id && (
                        <div className="mt-2">
                          <Form
                            onSubmit={(e: React.FormEvent) => {
                              e.preventDefault();
                              handleAddResponse(review.id);
                            }}
                          >
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={adminResponse}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminResponse(e.target.value)}
                              placeholder="Введите ответ..."
                              className="mb-2"
                            />
                            <div className="d-flex gap-1">
                              <Button type="submit" variant="primary" size="sm">
                                Отправить
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setShowResponseForm(null);
                                  setAdminResponse('');
                                }}
                              >
                                Отмена
                              </Button>
                            </div>
                          </Form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
