import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { closeCart, removeItem } from '@entities/cart/cart.slice';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RootState } from '@app/store';

export function CartWidgetDesktop() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isOpen } = useAppSelector((state: RootState) => state.cart);

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const handleRemove = (productId: string, size: string) => {
    dispatch(removeItem({ productId, size: size as any }));
    toast.success('Товар удалён из корзины', {
      icon: '🗑️',
    });
  };

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  if (!isOpen || items.length === 0) {
    return null;
  }

  return (
    <Card className="d-none d-md-block position-fixed" style={{
      bottom: '20px',
      right: '20px',
      width: '350px',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>🛒 Корзина</span>
        <Button variant="close" onClick={() => dispatch(closeCart())} />
      </Card.Header>
      <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {items.map((item) => (
          <div key={`${item.product.id}-${item.size}`} className="mb-3 pb-3 border-bottom">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="fw-bold">{item.product.name}</div>
                <small className="text-muted">
                  Размер: {item.size} × {item.quantity} шт.
                </small>
                <div className="text-primary fw-bold">
                  {(Number(item.product.price) * item.quantity).toFixed(0)} Br
                </div>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemove(item.product.id, item.size)}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </Card.Body>
      <Card.Footer>
        <div className="d-flex justify-content-between mb-2">
          <strong>Итого:</strong>
          <strong className="h5">{total.toFixed(0)} Br</strong>
        </div>
        <Button variant="primary" className="w-100 mb-2" onClick={() => navigate('/cart')}>
          Перейти в корзину
        </Button>
        <Button variant="success" className="w-100" onClick={handleCheckout}>
          Оформить заказ
        </Button>
      </Card.Footer>
    </Card>
  );
}
