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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      style={{ cursor: 'pointer', height: '100%' }}
      className="w-100"
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
                height: 'clamp(200px, 40vw, 280px)',
                width: '100%',
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
                top: '8px',
                right: '8px',
                background: 'var(--warning)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: 'clamp(10px, 2.5vw, 12px)',
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
                top: '8px',
                right: '8px',
                background: 'var(--error)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: 'clamp(10px, 2.5vw, 12px)',
                fontWeight: 600,
              }}
            >
              Нет в наличии
            </div>
          )}
        </div>

        <Card.Body className="d-flex flex-column p-3 p-md-4">
          <div
            style={{
              fontSize: 'clamp(10px, 2.5vw, 12px)',
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
              fontSize: 'clamp(14px, 3.5vw, 18px)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              minHeight: 'clamp(40px, 10vw, 50px)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {product.name}
          </Card.Title>

          <Card.Text
            className="text-muted small flex-grow-1"
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              lineHeight: 1.5,
            }}
          >
            {product.description.substring(0, 80)}...
          </Card.Text>

          <div className="mt-auto">
            {/* Sizes Preview */}
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}>
              {product.sizes.slice(0, 3).map((size) => (
                <span
                  key={size}
                  style={{
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    padding: '4px 8px',
                    background: 'var(--background)',
                    color: 'var(--text-secondary)',
                    borderRadius: '6px',
                    fontWeight: 500,
                  }}
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span
                  style={{
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    padding: '4px 8px',
                    background: 'var(--background)',
                    color: 'var(--text-tertiary)',
                    borderRadius: '6px',
                    fontWeight: 500,
                  }}
                >
                  +{product.sizes.length - 3}
                </span>
              )}
            </div>

            <div style={{
              marginBottom: '12px',
            }}>
              <div style={{
                fontSize: 'clamp(20px, 5vw, 28px)',
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
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  padding: 'clamp(8px, 2vw, 10px) 16px',
                }}
              >
                <ShoppingCart size={16} className="me-2" />
                В корзину
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}
