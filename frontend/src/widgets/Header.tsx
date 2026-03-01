import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { logout } from '@entities/user/user.slice';
import { Container, Nav, Navbar, Button, NavDropdown } from 'react-bootstrap';
import { CartWidget } from '@widgets/CartWidget';
import type { RootState } from '@app/store';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🌙 Pizhams
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Каталог</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            {isAuthenticated && user ? (
              <>
                <NavDropdown title={`👤 ${user.email}`} id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">
                    👤 Профиль
                  </NavDropdown.Item>
                  {user.role === 'admin' && (
                    <NavDropdown.Item onClick={() => navigate('/admin')}>
                      ⚙️ Админ-панель
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item onClick={handleLogout}>
                    🚪 Выйти
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/login')} className="me-2">
                  Войти
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Регистрация
                </Button>
              </>
            )}
            <CartWidget />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
