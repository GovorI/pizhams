import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { toggleCart } from '@entities/cart/cart.slice';
import { Badge, Button } from 'react-bootstrap';
import type { RootState } from '@app/store';

export function CartWidget() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state: RootState) => state.cart);
  
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Button
      variant="outline-primary"
      onClick={() => dispatch(toggleCart())}
      className="position-relative"
    >
      🛒 Корзина
      {totalCount > 0 && (
        <Badge
          bg="danger"
          pill
          className="position-absolute top-0 start-100 translate-middle"
        >
          {totalCount}
        </Badge>
      )}
    </Button>
  );
}
