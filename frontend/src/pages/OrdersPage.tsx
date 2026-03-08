import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks/redux';
import { useGetMyOrdersQuery } from '@shared/api/api';
import { Card, Container, Table, Badge, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import type { RootState } from '@app/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { data: orders = [], isLoading, error } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleShowDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge bg="warning">🆕 Новый</Badge>;
      case 'processing':
        return <Badge bg="info">⚙️ В работе</Badge>;
      case 'shipped':
        return <Badge bg="primary">📦 Отправлен</Badge>;
      case 'delivered':
        return <Badge bg="success">✅ Доставлен</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка заказов...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">📦 Мои заказы</h1>

      {error && (
        <Alert variant="danger">
          {('message' in error) ? error.message : 'Failed to load orders'}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h3 className="text-muted mb-3">У вас пока нет заказов</h3>
            <p className="text-muted mb-4">
              Оформите первый заказ в нашем магазине!
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Перейти в каталог
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>№ заказа</th>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: Order) => (
                  <tr key={order.id}>
                    <td>{order.id.slice(0, 8)}...</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td><strong>{order.total} Br</strong></td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleShowDetails(order)}
                      >
                        📋 Детали
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal with order details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Заказ #{selectedOrder?.id.slice(0, 8)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <h5>Товары:</h5>
              <Table striped size="sm">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Размер</th>
                    <th>Кол-во</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.size}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price} Br</td>
                      <td>{item.price * item.quantity} Br</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="text-end mt-3">
                <h4>Итого: <strong>{selectedOrder.total} Br</strong></h4>
              </div>

              <hr />

              <h5>Информация о доставке:</h5>
              <p>
                <strong>Имя:</strong> {selectedOrder.customerName}<br />
                <strong>Телефон:</strong> {selectedOrder.customerPhone}<br />
                <strong>Email:</strong> {selectedOrder.customerEmail}<br />
                <strong>Адрес:</strong> {selectedOrder.customerAddress}
              </p>

              <hr />

              <p>
                <strong>Статус:</strong> {getStatusBadge(selectedOrder.status)}
              </p>
              <p>
                <strong>Дата заказа:</strong> {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
