import { configureStore } from '@reduxjs/toolkit';
import { api } from '@shared/api/api';
import productsReducer from '@entities/products/products.slice';
import cartReducer from '@entities/cart/cart.slice';
import authReducer from '@entities/user/user.slice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
