import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks/redux';
import { logout } from '@entities/user/user.slice';
import { Container, Nav, Navbar, Button, NavDropdown, Offcanvas } from 'react-bootstrap';
import { CartWidget } from '@widgets/CartWidget';
import { Menu, X } from 'lucide-react';
import type { RootState } from '@app/store';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Каталог' },
    { to: '/memo', label: '🎮 Мемо' },
  ];

  return (
    <>
      {/* Desktop Header */}
      <Navbar bg="light" expand="lg" className="mb-4 d-none d-lg-block">
        <Container>
          <Navbar.Brand as={Link} to="/">
            🌙 Pizhams
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {navLinks.map((link) => (
                <Nav.Link key={link.to} as={Link} to={link.to}>
                  {link.label}
                </Nav.Link>
              ))}
            </Nav>
            <Nav className="align-items-center">
              {isAuthenticated && user ? (
                <>
                  <NavDropdown title={`👤 ${user.email}`} id="user-dropdown">
                    <NavDropdown.Item as={Link} to="/profile">
                      👤 Профиль
                    </NavDropdown.Item>
                    {user.role === 'admin' && (
                      <NavDropdown.Item as={Link} to="/admin">
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
                  {/* @ts-ignore */}
                  <Button variant="outline-primary" size="sm" as={Link} to="/login" className="me-2">
                    Войти
                  </Button>
                  {/* @ts-ignore */}
                  <Button variant="primary" size="sm" as={Link} to="/register">
                    Регистрация
                  </Button>
                </>
              )}
              <CartWidget />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Header */}
      <Navbar bg="light" className="mb-4 d-lg-none sticky-top">
        <Container className="d-flex justify-content-between align-items-center">
          <Navbar.Brand as={Link} to="/" className="mb-0">
            🌙 Pizhams
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-2">
            <CartWidget />
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="border-0"
            >
              <Menu size={24} />
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas show={mobileMenuOpen} onHide={() => setMobileMenuOpen(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>🌙 Pizhams</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {navLinks.map((link) => (
              <Nav.Link
                key={link.to}
                as={Link}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 border-bottom"
              >
                {link.label}
              </Nav.Link>
            ))}

            {isAuthenticated && user ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-bottom"
                >
                  👤 Профиль
                </Nav.Link>
                {user.role === 'admin' && (
                  <Nav.Link
                    as={Link}
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 border-bottom"
                  >
                    ⚙️ Админ-панель
                  </Nav.Link>
                )}
                <Nav.Link
                  onClick={handleLogout}
                  className="py-3 border-bottom text-danger"
                >
                  🚪 Выйти
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-bottom"
                >
                  🔐 Войти
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-bottom"
                >
                  📝 Регистрация
                </Nav.Link>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
