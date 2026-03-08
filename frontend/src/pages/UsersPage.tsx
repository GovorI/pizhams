import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@shared/hooks/redux';
import { Card, Container, Table, Badge, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import type { RootState } from '@app/store';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  isBanned?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function UsersPage() {
  const navigate = useNavigate();
  const { user: currentUser, token, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      fetchUsers();
      setShowRoleModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите заблокировать этого пользователя?')) return;

    try {
      const response = await fetch(`${API_URL}/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to ban user');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/unban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unban user');
      }

      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to unban user');
    }
  };

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Загрузка пользователей...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">👥 Управление пользователями</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Email</th>
                <th>Роль</th>
                <th>Дата регистрации</th>
                <th>Статус</th>
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
                    {user.isBanned ? (
                      <Badge bg="secondary">🚫 Заблокирован</Badge>
                    ) : (
                      <Badge bg="success">✅ Активен</Badge>
                    )}
                  </td>
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
                    {user.isBanned ? (
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleUnban(user.id)}
                      >
                        ✅ Разблокировать
                      </Button>
                    ) : (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleBan(user.id)}
                      >
                        🚫 Заблокировать
                      </Button>
                    )}
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

      {/* Role Update Modal */}
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
                  onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
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
