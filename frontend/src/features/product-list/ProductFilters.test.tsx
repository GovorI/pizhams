import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { ProductFilters } from './ProductFilters';
import productsReducer from '@entities/products/products.slice';

const createTestStore = () => configureStore({
  reducer: {
    products: productsReducer,
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

describe('ProductFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('should render all filter selects', () => {
    renderWithProviders(<ProductFilters onFilterChange={mockOnFilterChange} />);
    
    const allSelects = screen.getAllByRole('combobox');
    expect(allSelects).toHaveLength(3);
  });

  it('should have category dropdown with options', () => {
    renderWithProviders(<ProductFilters onFilterChange={mockOnFilterChange} />);
    
    // Check for category options in the document
    expect(screen.getByText('Все категории')).toBeInTheDocument();
    expect(screen.getByText('Женские')).toBeInTheDocument();
    expect(screen.getByText('Мужские')).toBeInTheDocument();
    expect(screen.getByText('Унисекс')).toBeInTheDocument();
    expect(screen.getByText('Детские')).toBeInTheDocument();
  });

  it('should have size dropdown with all sizes', () => {
    renderWithProviders(<ProductFilters onFilterChange={mockOnFilterChange} />);
    
    // Check for size options in the document
    expect(screen.getByText('Все размеры')).toBeInTheDocument();
    expect(screen.getByText('XS')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('XL')).toBeInTheDocument();
    expect(screen.getByText('XXL')).toBeInTheDocument();
  });

  it('should have color dropdown with options', () => {
    renderWithProviders(<ProductFilters onFilterChange={mockOnFilterChange} />);

    const allSelects = screen.getAllByRole('combobox');
    expect(allSelects).toHaveLength(3);
    
    // Check for some color options
    expect(screen.getByText('Красный')).toBeInTheDocument();
    expect(screen.getByText('Синий')).toBeInTheDocument();
    expect(screen.getByText('Черный')).toBeInTheDocument();
  });
});
