import { ProductList } from '@features/product-list/ProductList';

export function HomePage() {
  return (
    <div className="container py-4">
      <h1 className="mb-4">Каталог пижам</h1>
      <ProductList />
    </div>
  );
}
