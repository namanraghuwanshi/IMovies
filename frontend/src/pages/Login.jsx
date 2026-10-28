// Login Page Component
import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after successful login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper buttons to quickly fill demo accounts
  const fillDemoAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('admin123');
    setError('');
  };

  const fillDemoUser = () => {
    setEmail('user@imovies.com');
    setPassword('user123');
    setError('');
  };

  return (
    <Container className="py-5" style={{ maxWidth: '480px' }}>
      <Card className="shadow-sm border-0 rounded-3 p-4">
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">🎬</div>
          <h3 className="fw-bold">Sign In to IMovies</h3>
          <p className="text-muted small">Enter your credentials to manage tickets and bookings</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-semibold small">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="e.g. user@imovies.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="password">
            <Form.Label className="fw-semibold small">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            variant="danger"
            type="submit"
            className="w-100 fw-bold py-2 mb-3"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        {/* Demo Quick-Fill Buttons for testing / course evaluation */}
        <div className="p-3 bg-light rounded-3 mb-3 border">
          <div className="small fw-bold text-secondary mb-2 text-center">
            🚀 Quick-Fill Demo Credentials:
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="w-50 small"
              onClick={fillDemoUser}
            >
              Demo User
            </Button>
            <Button
              variant="outline-warning"
              size="sm"
              className="w-50 text-dark small"
              onClick={fillDemoAdmin}
            >
              Demo Admin
            </Button>
          </div>
        </div>

        <div className="text-center text-muted small mt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-danger fw-semibold text-decoration-none">
            Create an account
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
