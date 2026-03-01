import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { removeItem, updateQuantity, closeCart } from '@entities/cart/cart.slice';
import { Button, Card, Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import type { RootState, AppDispatch } from '@app/store';

export function CartPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state: RootState) => state.cart);

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const handleQuantityChange = (productId: string, size: string, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeItem({ productId, size: size as any }));
    } else {
      dispatch(updateQuantity({ productId, size: size as any, quantity }));
    }
  };

  const handleRemove = (productId: string, size: string) => {
    dispatch(removeItem({ productId, size: size as any }));
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h1 className="mb-4">Корзина</h1>
        <p className="text-muted mb-4">Ваша корзина пуста</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Перейти в каталог
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Корзина</h1>
      
      <Row>
        <Col md={8}>
          {items.map((item) => (
            <Card key={`${item.product.id}-${item.size}`} className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={2}>
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        style={{ width: '80px', height: '100px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    )}
                  </Col>
                  <Col md={4}>
                    <Card.Title className="h6">{item.product.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      Размер: {item.size}
                    </Card.Text>
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.product.id, item.size, parseInt(e.target.value))
                      }
                      style={{ width: '80px' }}
                    />
                  </Col>
                  <Col md={2}>
                    <strong>{(Number(item.product.price) * item.quantity).toFixed(0)} ₽</strong>
                  </Col>
                  <Col md={2} className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemove(item.product.id, item.size)}
                    >
                      Удалить
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Итого</Card.Title>
              <Card.Text className="h4 text-primary mb-3">
                {total.toFixed(0)} ₽
              </Card.Text>
              <Button variant="primary" className="w-100 mb-2" onClick={handleCheckout}>
                Оформить заказ
              </Button>
              <Button variant="outline-secondary" className="w-100" onClick={() => navigate('/')}>
                Продолжить покупки
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
