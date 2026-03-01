import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks/redux';
import { Card, Container, Row, Col, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import type { RootState } from '@app/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface DashboardStats {
  orders: {
    total: number;
    new: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    name: string;
    soldCount: number;
    revenue: number;
  }>;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [isAuthenticated, user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/statistics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка статистики...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">📊 Дашборд</h1>

      {/* Revenue Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card bg="success" text="white" className="text-center">
            <Card.Body>
              <Card.Title>💰 Сегодня</Card.Title>
              <Card.Text style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                {stats?.revenue.today.toLocaleString('ru-RU')} ₽
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="info" text="white" className="text-center">
            <Card.Body>
              <Card.Title>📅 Эта неделя</Card.Title>
              <Card.Text style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                {stats?.revenue.thisWeek.toLocaleString('ru-RU')} ₽
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="primary" text="white" className="text-center">
            <Card.Body>
              <Card.Title>📆 Этот месяц</Card.Title>
              <Card.Text style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                {stats?.revenue.thisMonth.toLocaleString('ru-RU')} ₽
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card bg="secondary" text="white" className="text-center">
            <Card.Body>
              <Card.Title>💵 Всего</Card.Title>
              <Card.Text style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                {stats?.revenue.total.toLocaleString('ru-RU')} ₽
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders & Products Stats */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title>📦 Заказы</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6} className="text-center mb-3">
                  <h3>{stats?.orders.total || 0}</h3>
                  <p className="text-muted">Всего заказов</p>
                </Col>
                <Col xs={3} className="text-center mb-3">
                  <Badge bg="warning" text="dark" style={{ fontSize: '1.2em' }}>
                    {stats?.orders.new || 0}
                  </Badge>
                  <p className="text-muted mt-1">Новых</p>
                </Col>
                <Col xs={3} className="text-center mb-3">
                  <Badge bg="info" style={{ fontSize: '1.2em' }}>
                    {stats?.orders.processing || 0}
                  </Badge>
                  <p className="text-muted mt-1">В работе</p>
                </Col>
                <Col xs={3} className="text-center mb-3">
                  <Badge bg="primary" style={{ fontSize: '1.2em' }}>
                    {stats?.orders.shipped || 0}
                  </Badge>
                  <p className="text-muted mt-1">Отправлен</p>
                </Col>
                <Col xs={3} className="text-center mb-3">
                  <Badge bg="success" style={{ fontSize: '1.2em' }}>
                    {stats?.orders.delivered || 0}
                  </Badge>
                  <p className="text-muted mt-1">Доставлен</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title>🛍️ Товары</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col xs={4} className="text-center mb-3">
                  <h3>{stats?.products.total || 0}</h3>
                  <p className="text-muted">Всего</p>
                </Col>
                <Col xs={4} className="text-center mb-3">
                  <h3>
                    <Badge bg="warning" text="dark">{stats?.products.lowStock || 0}</Badge>
                  </h3>
                  <p className="text-muted">Мало на складе</p>
                </Col>
                <Col xs={4} className="text-center mb-3">
                  <h3>
                    <Badge bg="danger">{stats?.products.outOfStock || 0}</Badge>
                  </h3>
                  <p className="text-muted">Нет на складе</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders & Top Products */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title>🕐 Последние заказы</Card.Title>
            </Card.Header>
            <Card.Body>
              {stats?.recentOrders.length === 0 ? (
                <p className="text-muted text-center">Заказов пока нет</p>
              ) : (
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.customerName}</td>
                        <td>{order.total} ₽</td>
                        <td>
                          <Badge bg={
                            order.status === 'new' ? 'warning' :
                            order.status === 'processing' ? 'info' :
                            order.status === 'shipped' ? 'primary' : 'success'
                          }>
                            {order.status === 'new' ? '🆕 Новый' :
                             order.status === 'processing' ? '⚙️ В работе' :
                             order.status === 'shipped' ? '📦 Отправлен' : '✅ Доставлен'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <Card.Title>🏆 Популярные товары</Card.Title>
            </Card.Header>
            <Card.Body>
              {stats?.topProducts.length === 0 ? (
                <p className="text-muted text-center">Продаж пока нет</p>
              ) : (
                <Table striped hover size="sm">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Продано</th>
                      <th>Выручка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td>{product.name}</td>
                        <td>{product.soldCount} шт.</td>
                        <td>{product.revenue.toLocaleString('ru-RU')} ₽</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
