import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { fetchProductById, clearSelectedProduct } from '@entities/products/products.slice';
import { addItem, openCart } from '@entities/cart/cart.slice';
import { Button, Card, Container, Row, Col, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import type { ProductSize } from '@shared/types/product.types';
import type { RootState } from '@app/store';
import { Reviews } from '@features/reviews/Reviews';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProduct, loading, error } = useAppSelector((state: RootState) => state.products);

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
    }
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
          <Card.Img
            src={selectedProduct.images[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
            alt={selectedProduct.name}
            style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
          />
        </Col>
        <Col md={6}>
          <h1 className="mb-3">{selectedProduct.name}</h1>
          <h2 className="text-primary mb-4">{selectedProduct.price.toLocaleString('ru-RU')} Br</h2>
          
          <p className="text-muted mb-4">{selectedProduct.description}</p>
          
          <div className="mb-4">
            <h5>Размеры:</h5>
            <div className="d-flex gap-2 flex-wrap">
              {selectedProduct.sizes.map((size) => (
                <Button
                  key={size}
                  variant="outline-primary"
                  onClick={() => handleAddToCart(size)}
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
          
          {selectedProduct.stock > 0 ? (
            <Alert variant="success">В наличии: {selectedProduct.stock} шт.</Alert>
          ) : (
            <Alert variant="danger">Нет в наличии</Alert>
          )}
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
