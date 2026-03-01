import { Link } from 'react-router-dom';
import type { Product } from '@shared/types/product.types';
import { Card, Button } from 'react-bootstrap';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="h-100">
      {product.images.length > 0 && (
        <Card.Img
          variant="top"
          src={product.images[0]}
          alt={product.name}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title>{product.name}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {product.description.substring(0, 100)}...
        </Card.Text>
        <div className="mt-auto">
          <div className="h5 mb-3">{product.price} ₽</div>
          <Button variant="primary" className="w-100">
            <Link to={`/product/${product.id}`} className="text-white text-decoration-none">
              Подробнее
            </Link>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
