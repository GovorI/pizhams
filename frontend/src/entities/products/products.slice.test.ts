import { describe, it, expect, beforeEach, vi } from 'vitest';
import productsReducer, {
  fetchProducts,
  fetchProductById,
  setFilters,
  clearSelectedProduct,
} from '@entities/products/products.slice';
import type { Product } from '@shared/types/product.types';

const mockProducts: Product[] = [
  {
    id: 'uuid-1',
    name: 'Product 1',
    description: 'Description 1',
    price: 1000,
    category: 'Category 1',
    sizes: ['S', 'M'],
    colors: ['Red'],
    images: ['image1.jpg'],
    stock: 10,
    created_at: '2026-02-18T00:00:00Z',
    updated_at: '2026-02-18T00:00:00Z',
  },
  {
    id: 'uuid-2',
    name: 'Product 2',
    description: 'Description 2',
    price: 2000,
    category: 'Category 2',
    sizes: ['L', 'XL'],
    colors: ['Blue'],
    images: ['image2.jpg'],
    stock: 5,
    created_at: '2026-02-18T00:00:00Z',
    updated_at: '2026-02-18T00:00:00Z',
  },
];

describe('productsSlice', () => {
  let initialState: ReturnType<typeof productsReducer>;

  beforeEach(() => {
    initialState = productsReducer(undefined, { type: 'unknown' });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(initialState.items).toEqual([]);
      expect(initialState.selectedProduct).toBeNull();
      expect(initialState.filters).toEqual({ page: 1, limit: 10 });
      expect(initialState.loading).toBe(false);
      expect(initialState.error).toBeNull();
      expect(initialState.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const newState = productsReducer(
        initialState,
        setFilters({ category: 'Test', page: 2 })
      );

      expect(newState.filters.category).toBe('Test');
      expect(newState.filters.page).toBe(2);
    });

    it('should merge with existing filters', () => {
      const stateWithFilters = productsReducer(
        initialState,
        setFilters({ category: 'Test', size: 'M' })
      );

      const newState = productsReducer(
        stateWithFilters,
        setFilters({ page: 3 })
      );

      expect(newState.filters.category).toBe('Test');
      expect(newState.filters.size).toBe('M');
      expect(newState.filters.page).toBe(3);
    });
  });

  describe('clearSelectedProduct', () => {
    it('should clear selected product', () => {
      const stateWithProduct = {
        ...initialState,
        selectedProduct: mockProducts[0],
      };

      const newState = productsReducer(stateWithProduct, clearSelectedProduct());

      expect(newState.selectedProduct).toBeNull();
    });
  });

  describe('fetchProducts.pending', () => {
    it('should set loading to true', () => {
      const newState = productsReducer(initialState, { type: 'products/fetchAll/pending' });
      expect(newState.loading).toBe(true);
    });
  });

  describe('fetchProducts.fulfilled', () => {
    it('should update items and pagination', () => {
      const action = {
        type: 'products/fetchAll/fulfilled',
        payload: {
          data: mockProducts,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      const newState = productsReducer(initialState, action);

      expect(newState.loading).toBe(false);
      expect(newState.items).toHaveLength(2);
      expect(newState.pagination.total).toBe(2);
      expect(newState.pagination.totalPages).toBe(1);
    });
  });

  describe('fetchProducts.rejected', () => {
    it('should set error', () => {
      const action = {
        type: 'products/fetchAll/rejected',
        error: { message: 'Failed to fetch' },
      };

      const newState = productsReducer(initialState, action);

      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Failed to fetch');
    });
  });

  describe('fetchProductById.fulfilled', () => {
    it('should set selected product', () => {
      const action = {
        type: 'products/fetchById/fulfilled',
        payload: mockProducts[0],
      };

      const newState = productsReducer(initialState, action);

      expect(newState.selectedProduct).toEqual(mockProducts[0]);
      expect(newState.loading).toBe(false);
    });
  });
});
