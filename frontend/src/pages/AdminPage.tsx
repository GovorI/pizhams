import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks/redux';
import {
  Table, Button, Container, Card, Spinner, Alert, Modal, Form, Badge, Nav,
} from 'react-bootstrap';
import type { RootState } from '@app/store';
import type { Product } from '@shared/types/product.types';
import { Dashboard } from '@pages/Dashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    size: string;
  }>;
  total: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userId: string;
  productId: string;
  isApproved: boolean;
  createdAt: string;
}

export function AdminPage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'reviews'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    stock: '',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchReviews();
  }, [isAuthenticated, user, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products?limit=100`);
      const data = await response.json();
      setProducts(data.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/export/csv`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export orders');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'orders.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to export orders');
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price),
        category: product.category,
        sizes: product.sizes,
        colors: product.colors,
        images: product.images,
        stock: String(product.stock),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        sizes: [],
        colors: [],
        images: [],
        stock: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
    };

    try {
      const url = editingProduct
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;
      
      const method = editingProduct ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      handleCloseModal();
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setUploadError('Пожалуйста, выберите изображение (jpg, jpeg, png, gif, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${API_URL}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const data = await response.json();
      setFormData({
        ...formData,
        images: [...formData.images, data.url],
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Админ-панель</h1>
        {activeTab === 'orders' && (
          <Button variant="success" onClick={handleExportCsv}>
            📊 Экспорт в CSV
          </Button>
        )}
        {activeTab === 'products' && (
          <Button variant="primary" onClick={() => handleOpenModal()}>
            + Добавить товар
          </Button>
        )}
      </div>

      <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k as any)}>
        <Nav.Item>
          <Nav.Link eventKey="dashboard">📊 Дашборд</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="products">Товары ({products.length})</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="orders">Заказы ({orders.length})</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="users">
            👥 Пользователи ({users.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="reviews">
            ⭐ Отзывы ({reviews.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {activeTab === 'dashboard' && <Dashboard />}

      {activeTab === 'products' && (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Изображение</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Размеры</th>
                  <th>Остаток</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td style={{ width: '80px' }}>
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <Badge bg="info">{product.category}</Badge>
                    </td>
                    <td>{product.price} Br</td>
                    <td>
                      {product.sizes.map((size) => (
                        <Badge key={size} bg="secondary" className="me-1">
                          {size}
                        </Badge>
                      ))}
                    </td>
                    <td>{product.stock} шт.</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenModal(product)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id.slice(0, 8)}...</td>
                    <td>
                      <div>{order.customerName}</div>
                      <small className="text-muted">{order.customerEmail}</small>
                    </td>
                    <td>{order.customerPhone}</td>
                    <td><strong>{order.total} Br</strong></td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        style={{ width: '150px' }}
                      >
                        <option value="new">🆕 Новый</option>
                        <option value="processing">⚙️ В работе</option>
                        <option value="shipped">📦 Отправлен</option>
                        <option value="delivered">✅ Доставлен</option>
                      </Form.Select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        📋 Детали
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {orders.length === 0 && (
              <div className="text-center py-5 text-muted">
                Заказов пока нет
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                        {user.role === 'admin' ? '👑 Администратор' : '👤 Пользователь'}
                      </Badge>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                      >
                        ✏️ Роль
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {users.length === 0 && (
              <div className="text-center py-5 text-muted">
                Пользователей пока нет
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'reviews' && (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Рейтинг</th>
                  <th>Товар</th>
                  <th>Пользователь</th>
                  <th>Комментарий</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ color: star <= review.rating ? '#fbbf24' : '#d1d5db' }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge bg="info">{review.productId.slice(0, 8)}...</Badge>
                    </td>
                    <td>{review.userName || 'Аноним'}</td>
                    <td style={{ maxWidth: '300px' }}>
                      {review.comment || <em className="text-muted">Без комментария</em>}
                    </td>
                    <td>
                      <Badge bg={review.isApproved ? 'success' : 'warning'}>
                        {review.isApproved ? '✅ Одобрено' : '⏳ На модерации'}
                      </Badge>
                    </td>
                    <td>
                      {!review.isApproved ? (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={async () => {
                            try {
                              await fetch(`${API_URL}/reviews/${review.id}`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({ isApproved: true }),
                              });
                              fetchReviews();
                            } catch (err: any) {
                              setError(err.message);
                            }
                          }}
                        >
                          ✅ Одобрить
                        </Button>
                      ) : null}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={async () => {
                          if (!confirm('Удалить отзыв?')) return;
                          try {
                            await fetch(`${API_URL}/reviews/${review.id}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });
                            fetchReviews();
                          } catch (err: any) {
                            setError(err.message);
                          }
                        }}
                      >
                        🗑️ Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {reviews.length === 0 && (
              <div className="text-center py-5 text-muted">
                Отзывов пока нет
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Редактировать товар' : 'Новый товар'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                name="description"
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Цена (Br)</Form.Label>
              <Form.Control
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Выберите категорию</option>
                <option value="Женские">Женские</option>
                <option value="Мужские">Мужские</option>
                <option value="Унисекс">Унисекс</option>
                <option value="Детские">Детские</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Остаток на складе</Form.Label>
              <Form.Control
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Размеры</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <Form.Check
                    key={size}
                    type="checkbox"
                    label={size}
                    checked={formData.sizes.includes(size as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          sizes: [...formData.sizes, size],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          sizes: formData.sizes.filter((s) => s !== size),
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Цвета</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {['Красный', 'Синий', 'Зеленый', 'Черный', 'Белый', 'Серый', 'Розовый', 'Голубой'].map((color) => (
                  <Form.Check
                    key={color}
                    type="checkbox"
                    label={color}
                    checked={formData.colors.includes(color)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          colors: [...formData.colors, color],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          colors: formData.colors.filter((c) => c !== color),
                        });
                      }
                    }}
                  />
                ))}
              </div>
              <Form.Control
                type="text"
                placeholder="Или введите свои цвета через запятую"
                className="mt-2"
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData({
                      ...formData,
                      colors: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                    });
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL изображения (через запятую)</Form.Label>
              <Form.Control
                name="images"
                value={formData.images.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images: e.target.value.split(',').map((i) => i.trim()).filter(Boolean),
                  })
                }
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Загрузить изображение</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              {uploading && (
                <div className="mt-2 text-muted">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Загрузка...
                </div>
              )}
              {uploadError && (
                <div className="mt-2 text-danger small">{uploadError}</div>
              )}
            </Form.Group>

            {formData.images.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Предпросмотр изображений</Form.Label>
                <div className="d-flex gap-2 flex-wrap">
                  {formData.images.map((img, index) => (
                    <div key={index} className="position-relative">
                      <img
                        src={img}
                        alt={`Preview ${index}`}
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        className="rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 start-100 translate-middle p-1 rounded-circle"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Сохранить' : 'Создать'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Order Details Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            📦 Заказ #{selectedOrder?.id.slice(0, 8)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-4">
                <h6 className="text-muted mb-2">Информация о клиенте</h6>
                <Card className="bg-light border-0">
                  <Card.Body>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Имя:</strong> {selectedOrder.customerName}</p>
                        <p className="mb-1"><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Телефон:</strong> {selectedOrder.customerPhone}</p>
                        <p className="mb-1"><strong>Дата:</strong> {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}</p>
                      </div>
                    </div>
                    <p className="mb-0 mt-2"><strong>Адрес доставки:</strong> {selectedOrder.customerAddress}</p>
                  </Card.Body>
                </Card>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Товары в заказе</h6>
                <Table striped size="sm">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Размер</th>
                      <th>Кол-во</th>
                      <th>Цена</th>
                      <th>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td><Badge bg="secondary">{item.size}</Badge></td>
                        <td>{item.quantity}</td>
                        <td>{item.price} Br</td>
                        <td><strong>{item.price * item.quantity} Br</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="text-end"><strong>Итого:</strong></td>
                      <td><strong className="text-primary">{selectedOrder.total} Br</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <div className="mb-3">
                <h6 className="text-muted mb-2">Статус заказа</h6>
                <Badge bg={
                  selectedOrder.status === 'new' ? 'warning' :
                  selectedOrder.status === 'processing' ? 'info' :
                  selectedOrder.status === 'shipped' ? 'primary' : 'success'
                } style={{ fontSize: '14px', padding: '8px 16px' }}>
                  {selectedOrder.status === 'new' && '🆕 Новый'}
                  {selectedOrder.status === 'processing' && '⚙️ В работе'}
                  {selectedOrder.status === 'shipped' && '📦 Отправлен'}
                  {selectedOrder.status === 'delivered' && '✅ Доставлен'}
                </Badge>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Изменить роль пользователя</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p className="mb-3"><strong>Email:</strong> {selectedUser.email}</p>
              <Form.Group>
                <Form.Label>Роль</Form.Label>
                <Form.Select
                  defaultValue={selectedUser.role}
                  onChange={(e) => {
                    fetch(`${API_URL}/users/${selectedUser.id}/role`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({ role: e.target.value }),
                    }).then(() => {
                      fetchUsers();
                      setShowRoleModal(false);
                    });
                  }}
                >
                  <option value="user">👤 Пользователь</option>
                  <option value="admin">👑 Администратор</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
