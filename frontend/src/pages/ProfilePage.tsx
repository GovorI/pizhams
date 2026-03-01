import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { logout } from '@entities/user/user.slice';
import { useGetMyOrdersQuery } from '@shared/api/api';
import {
  Container, Card, Form, Button, Alert, Spinner, Row, Col, Badge,
} from 'react-bootstrap';
import type { RootState } from '@app/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { data: orders = [] } = useGetMyOrdersQuery(undefined, { skip: !isAuthenticated });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setProfileData({ email: user.email });
    }
  }, [isAuthenticated, user, navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: profileData.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      setSuccess('Профиль успешно обновлен');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/me/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      setSuccess('Пароль успешно изменен');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">👤 Профиль пользователя</h1>

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

      {/* Profile Header with Avatar */}
      <Card className="mb-4">
        <Card.Body className="text-center">
          <div className="mb-3">
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6f42c1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: '48px',
                color: 'white',
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <h3>{user?.email || 'Пользователь'}</h3>
          <Badge bg={user?.role === 'admin' ? 'danger' : 'primary'} className="mt-2">
            {user?.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
          </Badge>
          <div className="mt-3">
            <Badge bg="info" className="me-2">
              📦 Заказов: {orders.length}
            </Badge>
            <Badge bg="success">
              ✅ Активен
            </Badge>
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>✏️ Личная информация</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ email: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Роль</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.role || ''}
                    disabled
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Сохранение...
                    </>
                  ) : (
                    '💾 Сохранить изменения'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>🔐 Смена пароля</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label>Текущий пароль</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Новый пароль</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Подтверждение пароля</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Сохранение...
                    </>
                  ) : (
                    '🔑 Изменить пароль'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>⚡ Быстрые действия</Card.Title>
        </Card.Header>
        <Card.Body>
          <Button variant="outline-primary" className="me-2" onClick={() => navigate('/orders')}>
            📦 Мои заказы
          </Button>
          {user?.role === 'admin' && (
            <Button variant="outline-danger" className="me-2" onClick={() => navigate('/admin')}>
              ⚙️ Админ-панель
            </Button>
          )}
          <Button variant="outline-secondary" className="me-2" onClick={() => navigate('/')}>
            🛍️ В каталог
          </Button>
          <Button variant="outline-danger" onClick={handleLogout}>
            🚪 Выйти
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
