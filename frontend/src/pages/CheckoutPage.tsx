import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { useCreateOrderMutation } from '@shared/api/api';
import { clearCart } from '@entities/cart/cart.slice';
import { Button, Card, Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import type { RootState } from '@app/store';

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
}

const initialFormData: OrderFormData = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state: RootState) => state.cart);
  const { isAuthenticated, user, token } = useAppSelector((state: RootState) => state.auth);
  const [createOrder, { isLoading, isError, error, isSuccess }] = useCreateOrderMutation();
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        customerEmail: user.email,
        customerName: user.email.split('@')[0], // Use email prefix as name
      }));
    }
  }, [user]);

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderItems = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: Number(item.product.price),
      size: item.size,
    }));

    try {
      await createOrder({
        ...formData,
        items: orderItems,
      }).unwrap();
      
      dispatch(clearCart());
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  if (isSuccess) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="success" className="mb-4">
          <Alert.Heading>Заказ успешно оформлен!</Alert.Heading>
          <p>Наш менеджер свяжется с вами в ближайшее время.</p>
        </Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Вернуться в каталог
        </Button>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h1 className="mb-4">Оформление заказа</h1>
        <Alert variant="warning">Ваша корзина пуста</Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Перейти в каталог
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Оформление заказа</h1>
      
      <Row>
        <Col md={7}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="mb-4">Контактная информация</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>ФИО *</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    isInvalid={touched.customerName && !formData.customerName}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Введите ФИО
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Телефон *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    isInvalid={touched.customerPhone && !formData.customerPhone}
                    placeholder="+7 (___) ___-__-__"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Введите телефон
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    isInvalid={touched.customerEmail && !formData.customerEmail}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Введите корректный email
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Адрес доставки *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    isInvalid={touched.customerAddress && !formData.customerAddress}
                    placeholder="Город, улица, дом, квартира"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Введите адрес доставки
                  </Form.Control.Feedback>
                </Form.Group>
                
                {isError && (
                  <Alert variant="danger" className="mb-3">
                    Ошибка при оформлении заказа: {(error as any)?.data?.message || 'Попробуйте позже'}
                  </Alert>
                )}
                
                <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Оформление...
                    </>
                  ) : (
                    `Оплатить ${total.toFixed(0)} Br`
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card>
            <Card.Header>Ваш заказ</Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                    <div>
                      <div className="fw-bold">{item.product.name}</div>
                      <small className="text-muted">
                        Размер: {item.size} × {item.quantity} шт.
                      </small>
                    </div>
                    <div>
                      {(Number(item.product.price) * item.quantity).toFixed(0)} Br
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                <strong>Итого:</strong>
                <strong className="h5 text-primary">{total.toFixed(0)} Br</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
