// Responsive Bootstrap Navbar Component
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-2">
      <Container>
        {/* Brand Logo */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-warning d-flex align-items-center">
          <span className="me-2">🎬</span> IMovies
        </Navbar.Brand>

        {/* Mobile Hamburger Toggle */}
        <Navbar.Toggle aria-controls="imovies-navbar-nav" />

        <Navbar.Collapse id="imovies-navbar-nav">
          {/* Left-aligned Links */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="text-light">
              Home
            </Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/my-bookings" className="text-light">
                My Bookings
              </Nav.Link>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to="/admin" className="text-warning fw-semibold">
                ⭐ Admin Dashboard
              </Nav.Link>
            )}
          </Nav>

          {/* Right-aligned Auth Actions */}
          <Nav className="align-items-lg-center gap-2">
            {user ? (
              <>
                <span className="text-light me-2 small">
                  Welcome, <strong className="text-info">{user.name}</strong>
                  {isAdmin && <span className="badge bg-warning text-dark ms-1">Admin</span>}
                </span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="px-3"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-light">
                  Login
                </Nav.Link>
                <Button
                  as={Link}
                  to="/register"
                  variant="warning"
                  size="sm"
                  className="fw-semibold px-3 text-dark"
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
