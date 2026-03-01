import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductFilters, PaginatedResponse } from '@shared/types/product.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  filters: { page: 1, limit: 10 },
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filters: ProductFilters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const url = `${API_URL}/products?${queryParams.toString()}`;
    console.log('Fetching products from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Products API error:', response.status, errorText);
      throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
    }
    return response.json() as Promise<PaginatedResponse<Product>>;
  },
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: string) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json() as Promise<Product>;
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    resetFilters: (state) => {
      state.filters = { page: 1, limit: 10 };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product';
      });
  },
});

export const { setFilters, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
