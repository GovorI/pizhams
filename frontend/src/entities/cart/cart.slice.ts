import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductSize } from '@shared/types/product.types';

export interface CartItem {
  product: Product;
  quantity: number;
  size: ProductSize;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ product: Product; size: ProductSize; quantity?: number }>) => {
      const { product, size, quantity = 1 } = action.payload;
      const existingItem = state.items.find(
        (item) => item.product.id === product.id && item.size === size,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, size });
      }
    },
    removeItem: (state, action: PayloadAction<{ productId: string; size: ProductSize }>) => {
      const { productId, size } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.product.id === productId && item.size === size),
      );
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; size: ProductSize; quantity: number }>,
    ) => {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.product.id === productId && item.size === size,
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
} = cartSlice.actions;

export default cartSlice.reducer;
