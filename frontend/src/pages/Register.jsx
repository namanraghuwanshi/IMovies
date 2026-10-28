// Register Page Component
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '480px' }}>
      <Card className="shadow-sm border-0 rounded-3 p-4">
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">🎟️</div>
          <h3 className="fw-bold">Create an Account</h3>
          <p className="text-muted small">Join IMovies to book movie tickets effortlessly</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="fw-semibold small">Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label className="fw-semibold small">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label className="fw-semibold small">Password (Min 6 chars)</Form.Label>
            <Form.Control
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="confirmPassword">
            <Form.Label className="fw-semibold small">Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Re-type your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            variant="danger"
            type="submit"
            className="w-100 fw-bold py-2 mb-3"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Form>

        <div className="text-center text-muted small mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-danger fw-semibold text-decoration-none">
            Sign In
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;
