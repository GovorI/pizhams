import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { fetchProducts, setFilters } from '@entities/products/products.slice';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { Pagination } from './Pagination';
import type { ProductFilters as ProductFiltersType } from '@shared/types/product.types';
import type { RootState } from '@app/store';
import type { Product } from '@shared/types/product.types';

export function ProductList() {
  const dispatch = useAppDispatch();
  const { items, loading, error, pagination, filters } = useAppSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters.page, filters.limit, filters.category]);

  // Frontend filtering for size and color (backend doesn't support array column filtering)
  const filteredItems = useMemo(() => {
    return items.filter((product) => {
      // Filter by size
      if (filters.size && !product.sizes.includes(filters.size)) {
        return false;
      }
      // Filter by color
      if (filters.color && !product.colors.some(c => c.toLowerCase().includes(filters.color!.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [items, filters.size, filters.color]);

  const handleFilterChange = useCallback((newFilters: Partial<ProductFiltersType>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  if (loading) {
    return <div className="text-center py-5">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <strong>Ошибка:</strong> {error}
        <div className="mt-2">
          <small>
            Проверьте подключение к интернету или попробуйте обновить страницу.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProductFilters onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-center py-5">Загрузка...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-5">
          {items.length === 0 ? 'Товары не найдены' : 'По заданным фильтрам товаров не найдено'}
        </div>
      ) : (
        <>
          <div className="row g-4">
            {filteredItems.map((product: Product) => (
              <div key={product.id} className="col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(filteredItems.length / pagination.limit)}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
