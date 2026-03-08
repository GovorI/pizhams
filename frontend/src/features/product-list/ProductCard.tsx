import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@shared/hooks/redux';
import { addItem, openCart } from '@entities/cart/cart.slice';
import type { Product } from '@shared/types/product.types';
import { Button, Card } from 'react-bootstrap';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const size = product.sizes[0] || 'M';
    dispatch(addItem({ product, size, quantity: 1 }));
    dispatch(openCart());
    toast.success(`${product.name} добавлен в корзину!`, {
      icon: '🛒',
      position: 'top-right',
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <Card
        className="h-100 border-0 shadow-sm"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'var(--surface)',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {product.images.length > 0 && (
            <Card.Img
              variant="top"
              src={product.images[0]}
              alt={product.name}
              style={{
                height: '280px',
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          )}

          {/* Stock Badge */}
          {product.stock < 5 && product.stock > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'var(--warning)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Осталось: {product.stock}
            </div>
          )}

          {product.stock === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'var(--error)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Нет в наличии
            </div>
          )}
        </div>

        <Card.Body className="d-flex flex-column p-4">
          <div
            style={{
              fontSize: '12px',
              color: 'var(--primary)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            {product.category}
          </div>

          <Card.Title
            className="mb-2"
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </Card.Title>

          <Card.Text
            className="text-muted small flex-grow-1"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          >
            {product.description.substring(0, 100)}...
          </Card.Text>

          <div className="mt-auto">
            {/* Sizes Preview */}
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}>
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    background: 'var(--background)',
                    color: 'var(--text-secondary)',
                    borderRadius: '6px',
                    fontWeight: 500,
                  }}
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    background: 'var(--background)',
                    color: 'var(--text-tertiary)',
                    borderRadius: '6px',
                    fontWeight: 500,
                  }}
                >
                  +{product.sizes.length - 4}
                </span>
              )}
            </div>

            <div style={{
              marginBottom: '12px',
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
              }}>
                {product.price.toLocaleString('ru-RU')} Br
              </div>
            </div>

            {/* Add to Cart Button */}
            {product.stock > 0 && (
              <Button
                variant="outline-primary"
                className="w-100"
                onClick={handleAddToCart}
                style={{
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                <ShoppingCart size={18} className="me-2" />
                В корзину
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}
