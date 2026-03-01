import { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useAppSelector } from '@shared/hooks/redux';
import type { ProductFilters as ProductFiltersType } from '@shared/types/product.types';
import { ProductSize } from '@shared/types/product.types';
import type { RootState } from '@app/store';

interface ProductFiltersProps {
  onFilterChange: (filters: Partial<ProductFiltersType>) => void;
}

const CATEGORIES = [
  'Женские',
  'Мужские',
  'Унисекс',
  'Детские',
];

const COLORS = [
  'Красный',
  'Синий',
  'Зеленый',
  'Черный',
  'Белый',
  'Серый',
  'Розовый',
  'Голубой',
  'Бордовый',
  'Персиковый',
  'Золотой',
  'Серебряный',
  'Серый меланж',
];

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const filters = useAppSelector((state: RootState) => state.products.filters);
  const [category, setCategory] = useState(filters.category || '');
  const [size, setSize] = useState(filters.size || '');
  const [color, setColor] = useState(filters.color || '');

  // Sync local state with Redux filters
  useEffect(() => {
    setCategory(filters.category || '');
    setSize(filters.size || '');
    setColor(filters.color || '');
  }, [filters.category, filters.size, filters.color]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onFilterChange({
        category: category || undefined,
        size: (size as ProductFiltersType['size']) || undefined,
        color: color || undefined,
      });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [category, size, color]); // Only depend on local state values

  return (
    <Row className="mb-4">
      <Col md={4}>
        <Form.Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col md={4}>
        <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="">Все размеры</option>
          {Object.values(ProductSize).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col md={4}>
        <Form.Select
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          <option value="">Все цвета</option>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  );
}
