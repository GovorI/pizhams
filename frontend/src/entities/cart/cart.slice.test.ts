import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  type CartItem,
} from '@entities/cart/cart.slice';
import type { Product, ProductSize } from '@shared/types/product.types';

const mockProduct: Product = {
  id: 'test-uuid-123',
  name: 'Test Pizhama',
  description: 'Test description',
  price: 2990,
  category: 'Женские',
  sizes: ['S', 'M', 'L'],
  colors: ['Red', 'Blue'],
  images: ['https://via.placeholder.com/400x500?text=Test'],
  stock: 10,
  created_at: '2026-02-18T00:00:00Z',
  updated_at: '2026-02-18T00:00:00Z',
};

describe('cartSlice', () => {
  let initialState: ReturnType<typeof cartReducer>;

  beforeEach(() => {
    initialState = cartReducer(undefined, { type: 'unknown' });
  });

  describe('addItem', () => {
    it('should add item to empty cart', () => {
      const newState = cartReducer(
        initialState,
        addItem({ product: mockProduct, size: 'M', quantity: 1 })
      );

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]).toEqual({
        product: mockProduct,
        quantity: 1,
        size: 'M',
      });
    });

    it('should increase quantity for existing item', () => {
      const stateWithItem = cartReducer(
        initialState,
        addItem({ product: mockProduct, size: 'M', quantity: 1 })
      );

      const newState = cartReducer(
        stateWithItem,
        addItem({ product: mockProduct, size: 'M', quantity: 2 })
      );

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].quantity).toBe(3);
    });

    it('should add different size as separate item', () => {
      const stateWithItem = cartReducer(
        initialState,
        addItem({ product: mockProduct, size: 'M', quantity: 1 })
      );

      const newState = cartReducer(
        stateWithItem,
        addItem({ product: mockProduct, size: 'L', quantity: 1 })
      );

      expect(newState.items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const stateWithItem = cartReducer(
        initialState,
        addItem({ product: mockProduct, size: 'M', quantity: 1 })
      );

      const newState = cartReducer(
        stateWithItem,
        removeItem({ productId: mockProduct.id, size: 'M' })
      );

      expect(newState.items).toHaveLength(0);
    });

    it('should not remove other items', () => {
      const stateWithItems = cartReducer(initialState, addItem({ product: mockProduct, size: 'M', quantity: 1 }));
      const stateWithItems2 = cartReducer(stateWithItems, addItem({ product: mockProduct, size: 'L', quantity: 1 }));

      const newState = cartReducer(
        stateWithItems2,
        removeItem({ productId: mockProduct.id, size: 'M' })
      );

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].size).toBe('L');
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const stateWithItem = cartReducer(
        initialState,
        addItem({ product: mockProduct, size: 'M', quantity: 1 })
      );

      const newState = cartReducer(
        stateWithItem,
        updateQuantity({ productId: mockProduct.id, size: 'M', quantity: 5 })
      );

      expect(newState.items[0].quantity).toBe(5);
    });
  });

  describe('toggleCart/openCart/closeCart', () => {
    it('should toggle cart open state', () => {
      expect(initialState.isOpen).toBe(false);

      const newState = cartReducer(initialState, toggleCart());
      expect(newState.isOpen).toBe(true);

      const newState2 = cartReducer(newState, toggleCart());
      expect(newState2.isOpen).toBe(false);
    });

    it('should open cart', () => {
      const newState = cartReducer(initialState, openCart());
      expect(newState.isOpen).toBe(true);
    });

    it('should close cart', () => {
      const stateOpen = cartReducer(initialState, openCart());
      const newState = cartReducer(stateOpen, closeCart());
      expect(newState.isOpen).toBe(false);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const stateWithItems = cartReducer(initialState, addItem({ product: mockProduct, size: 'M', quantity: 1 }));
      const stateWithItems2 = cartReducer(stateWithItems, addItem({ product: mockProduct, size: 'L', quantity: 2 }));

      const newState = cartReducer(stateWithItems2, clearCart());

      expect(newState.items).toHaveLength(0);
      expect(newState.isOpen).toBe(false);
    });
  });
});
