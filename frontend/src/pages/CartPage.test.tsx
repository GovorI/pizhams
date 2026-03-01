import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { CartPage } from './CartPage';
import cartReducer from '@entities/cart/cart.slice';

const createTestStore = (initialCart = {}) => configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: {
    cart: {
      items: [],
      isOpen: false,
      ...initialCart,
    },
  },
});

const renderWithProviders = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('CartPage', () => {
  it('should render empty cart message', () => {
    renderWithProviders(<CartPage />);
    
    expect(screen.getByText('Корзина')).toBeInTheDocument();
    expect(screen.getByText('Ваша корзина пуста')).toBeInTheDocument();
    expect(screen.getByText('Перейти в каталог')).toBeInTheDocument();
  });

  it('should render cart items when cart has items', () => {
    const mockCartItem = {
      product: {
        id: 'test-uuid-123',
        name: 'Test Pizhama',
        description: 'Test description',
        price: 2990,
        category: 'Женские',
        sizes: ['S', 'M', 'L'],
        colors: ['Red', 'Blue'],
        images: ['test-image.jpg'],
        stock: 10,
        created_at: '2026-02-18T00:00:00Z',
        updated_at: '2026-02-18T00:00:00Z',
      },
      quantity: 2,
      size: 'M',
    };

    const store = createTestStore({
      items: [mockCartItem],
      isOpen: false,
    });

    renderWithProviders(<CartPage />, store);
    
    expect(screen.getByText('Корзина')).toBeInTheDocument();
    expect(screen.getByText('Test Pizhama')).toBeInTheDocument();
    expect(screen.getByText('Размер: M')).toBeInTheDocument();
    // Item total should be 2990 * 2 = 5980 - check in item row
    const itemTotals = screen.getAllByText(/5980/);
    expect(itemTotals.length).toBeGreaterThan(0);
  });

  it('should render total sum correctly', () => {
    const mockCartItem1 = {
      product: {
        id: 'uuid-1',
        name: 'Product 1',
        description: 'Desc 1',
        price: 1000,
        category: 'Test',
        sizes: ['M'],
        colors: ['Red'],
        images: [],
        stock: 5,
        created_at: '2026-02-18T00:00:00Z',
        updated_at: '2026-02-18T00:00:00Z',
      },
      quantity: 1,
      size: 'M',
    };

    const mockCartItem2 = {
      product: {
        id: 'uuid-2',
        name: 'Product 2',
        description: 'Desc 2',
        price: 2000,
        category: 'Test',
        sizes: ['L'],
        colors: ['Blue'],
        images: [],
        stock: 3,
        created_at: '2026-02-18T00:00:00Z',
        updated_at: '2026-02-18T00:00:00Z',
      },
      quantity: 2,
      size: 'L',
    };

    const store = createTestStore({
      items: [mockCartItem1, mockCartItem2],
      isOpen: false,
    });

    renderWithProviders(<CartPage />, store);
    
    // Total should be 1000 * 1 + 2000 * 2 = 5000
    expect(screen.getByText('5000 ₽')).toBeInTheDocument();
  });

  it('should have checkout button', () => {
    const store = createTestStore({
      items: [{
        product: {
          id: 'uuid-1',
          name: 'Product',
          description: 'Desc',
          price: 1000,
          category: 'Test',
          sizes: ['M'],
          colors: ['Red'],
          images: [],
          stock: 5,
          created_at: '2026-02-18T00:00:00Z',
          updated_at: '2026-02-18T00:00:00Z',
        },
        quantity: 1,
        size: 'M',
      }],
      isOpen: false,
    });

    renderWithProviders(<CartPage />, store);
    
    expect(screen.getByText('Оформить заказ')).toBeInTheDocument();
  });

  it('should have continue shopping button', () => {
    const store = createTestStore({
      items: [{
        product: {
          id: 'uuid-1',
          name: 'Product',
          description: 'Desc',
          price: 1000,
          category: 'Test',
          sizes: ['M'],
          colors: ['Red'],
          images: [],
          stock: 5,
          created_at: '2026-02-18T00:00:00Z',
          updated_at: '2026-02-18T00:00:00Z',
        },
        quantity: 1,
        size: 'M',
      }],
      isOpen: false,
    });

    renderWithProviders(<CartPage />, store);
    
    expect(screen.getByText('Продолжить покупки')).toBeInTheDocument();
  });
});
