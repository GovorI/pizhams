import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { closeCart, removeItem } from '@entities/cart/cart.slice';
import { Button, Offcanvas, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RootState } from '@app/store';

export function CartSidebar() {
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

  return (
    <Offcanvas show={isOpen} onHide={() => dispatch(closeCart())} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Корзина</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {items.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-3">Ваша корзина пуста</p>
            <Button variant="primary" onClick={() => { dispatch(closeCart()); navigate('/'); }}>
              Перейти в каталог
            </Button>
          </div>
        ) : (
          <>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {items.map((item) => (
                <Card key={`${item.product.id}-${item.size}`} className="mb-3">
                  <Card.Body className="p-2">
                    <div className="d-flex justify-content-between align-items-center">
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
                  </Card.Body>
                </Card>
              ))}
            </div>
            
            <div className="border-top pt-3 mt-3">
              <div className="d-flex justify-content-between mb-3">
                <strong>Итого:</strong>
                <strong className="h5">{total.toFixed(0)} Br</strong>
              </div>
              <Button variant="primary" className="w-100 mb-2" onClick={() => { dispatch(closeCart()); navigate('/cart'); }}>
                Перейти в корзину
              </Button>
              <Button variant="success" className="w-100" onClick={() => { dispatch(closeCart()); navigate('/checkout'); }}>
                Оформить заказ
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
