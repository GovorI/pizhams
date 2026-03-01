import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ProductCard } from '@features/product-list/ProductCard';
import cartReducer from '@entities/cart/cart.slice';
import type { Product } from '@shared/types/product.types';

const createTestStore = () => configureStore({
  reducer: {
    cart: cartReducer,
  },
});

const mockProduct: Product = {
  id: 'test-uuid-123',
  name: 'Test Pizhama',
  description: 'Test description for the product',
  price: 2990,
  category: 'Женские',
  sizes: ['S', 'M', 'L'],
  colors: ['Red', 'Blue'],
  images: ['https://via.placeholder.com/400x500?text=Test'],
  stock: 10,
  created_at: '2026-02-18T00:00:00Z',
  updated_at: '2026-02-18T00:00:00Z',
};

const renderWithProviders = (component: React.ReactElement, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('ProductCard', () => {
  it('should render product name and price', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Pizhama')).toBeInTheDocument();
    expect(screen.getByText(/2990/)).toBeInTheDocument();
  });

  it('should render product image', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const image = screen.getByAltText('Test Pizhama');
    expect(image).toBeInTheDocument();
  });

  it('should have link to product page', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);
    
    const link = screen.getByText('Подробнее');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/product/test-uuid-123');
  });
});
