export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: ProductSize[];
  colors: string[];
  images: string[];
  stock: number;
  created_at: string;
  updated_at: string;
}

export const ProductSize = {
  XS: 'XS',
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
  XXL: 'XXL',
} as const;

export type ProductSize = (typeof ProductSize)[keyof typeof ProductSize];

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  size?: ProductSize;
  color?: string;
  page?: number;
  limit?: number;
}
