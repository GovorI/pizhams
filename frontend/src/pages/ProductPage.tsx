import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { fetchProductById, clearSelectedProduct } from '@entities/products/products.slice';
import { addItem, openCart } from '@entities/cart/cart.slice';
import { Button, Card, Container, Row, Col, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ProductSize } from '@shared/types/product.types';
import type { RootState } from '@app/store';
import { Reviews } from '@features/reviews/Reviews';
import { ImageSlider } from '@shared/ui/ImageSlider';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProduct, loading, error } = useAppSelector((state: RootState) => state.products);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  const handleAddToCart = (size: ProductSize) => {
    if (selectedProduct) {
      dispatch(addItem({ product: selectedProduct, size, quantity: 1 }));
      dispatch(openCart());
      toast.success(`${selectedProduct.name} добавлен в корзину!`, {
        icon: '🛒',
      });
    }
  };

  const handleQuickAddToCart = () => {
    if (!selectedSize) {
      toast.error('Пожалуйста, выберите размер', {
        icon: '⚠️',
      });
      return;
    }
    handleAddToCart(selectedSize);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка...</p>
      </Container>
    );
  }

  if (error || !selectedProduct) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Товар не найден'}
        </Alert>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Вернуться в каталог
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate('/')} className="mb-3 ps-0">
        ← Назад в каталог
      </Button>
      
      <Row>
        <Col md={6}>
          <ImageSlider
            images={selectedProduct.images}
            alt={selectedProduct.name}
          />
        </Col>
        <Col md={6}>
          <h1 className="mb-3">{selectedProduct.name}</h1>
          <h2 className="text-primary mb-4">{selectedProduct.price.toLocaleString('ru-RU')} Br</h2>
          
          <div className="mb-4">
            <h5>Размеры:</h5>
            <div className="d-flex gap-2 flex-wrap">
              {selectedProduct.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'primary' : 'outline-primary'}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h5>Цвет:</h5>
            <div className="d-flex gap-2 flex-wrap">
              {selectedProduct.colors.map((color) => (
                <span key={color} className="badge bg-secondary">
                  {color}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h5>Категория:</h5>
            <span className="badge bg-info">{selectedProduct.category}</span>
          </div>
          
          <div className="d-flex align-items-center gap-3 mb-4">
            {selectedProduct.stock > 0 ? (
              <Alert variant="success" className="mb-0 flex-grow-1">В наличии: {selectedProduct.stock} шт.</Alert>
            ) : (
              <Alert variant="danger" className="mb-0 flex-grow-1">Нет в наличии</Alert>
            )}
            {selectedProduct.stock > 0 && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleQuickAddToCart}
                className="d-flex align-items-center gap-2"
                style={{ minWidth: '180px' }}
              >
                <ShoppingCart size={20} />
                В корзину
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Product Description */}
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Body>
              <h3 className="mb-3">Описание товара</h3>
              <p style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>{selectedProduct.description}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reviews Section */}
      <Row className="mt-5">
        <Col>
          <Reviews productId={id!} />
        </Col>
      </Row>
    </Container>
  );
}
