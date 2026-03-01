import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card>
              <Card.Header className="text-center">
                <h3>✅ Письмо отправлено</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Alert variant="success">
                  <p>Если пользователь с email <strong>{email}</strong> существует, вы получите инструкцию по сбросу пароля.</p>
                </Alert>
                <p className="text-muted">
                  Проверьте папку "Спам", если письмо не пришло в течение нескольких минут.
                </p>
                <Button variant="primary" onClick={() => navigate('/login')} className="mt-3">
                  Вернуться ко входу
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card>
            <Card.Header className="text-center">
              <h3>🔑 Восстановление пароля</h3>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}

              <p className="text-muted mb-4">
                Введите ваш email, и мы отправим инструкцию по сбросу пароля.
              </p>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить инструкцию'
                  )}
                </Button>

                <div className="text-center">
                  <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="text-decoration-none">
                    ← Вернуться ко входу
                  </a>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
