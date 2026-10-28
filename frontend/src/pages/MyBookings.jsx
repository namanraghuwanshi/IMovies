// My Bookings Page Component
// Lists all ticket reservations made by the logged-in user with cancellation support
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Alert } from 'react-bootstrap';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Fetch bookings for current user
  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/bookings/my');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to load your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking? Your seats will be released immediately.'
    );

    if (!confirmCancel) return;

    try {
      setActionMessage('');
      setError('');

      const response = await API.put(`/bookings/${bookingId}/cancel`);

      setActionMessage('Booking was cancelled successfully and seats have been released.');

      // Update the local booking status
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your bookings..." />;
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🎟️ My Bookings</h2>
          <p className="text-muted small mb-0">View all your confirmed and past movie reservations</p>
        </div>
        <Button as={Link} to="/" variant="outline-danger" size="sm">
          Browse More Movies
        </Button>
      </div>

      {/* Feedback Alerts */}
      {actionMessage && (
        <Alert variant="success" dismissible onClose={() => setActionMessage('')}>
          {actionMessage}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Card className="text-center py-5 border-0 shadow-sm rounded-3">
          <Card.Body>
            <div className="fs-1 mb-2">🍿</div>
            <h4 className="fw-bold text-muted">No Bookings Yet</h4>
            <p className="text-secondary">You haven't reserved any movie tickets yet.</p>
            <Button as={Link} to="/" variant="danger" className="fw-semibold">
              Explore Now Showing Movies
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking) => {
            const movie = booking.showtime?.movie;
            const isConfirmed = booking.status === 'confirmed';

            return (
              <Card key={booking._id} className="shadow-sm border-0 overflow-hidden">
                <Card.Body className="p-4">
                  <Row className="align-items-center g-3">
                    {/* Poster Thumbnail */}
                    <Col xs={3} sm={2} md={2} lg={1}>
                      <img
                        src={movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600'}
                        alt={movie?.title || 'Movie'}
                        className="rounded"
                        style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
                        }}
                      />
                    </Col>

                    {/* Movie & Showtime Details */}
                    <Col xs={9} sm={6} md={6} lg={6}>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 className="fw-bold mb-0 text-dark">
                          {movie?.title || 'Movie Details Unavailable'}
                        </h5>
                        <Badge bg={isConfirmed ? 'success' : 'secondary'}>
                          {isConfirmed ? 'Confirmed' : 'Cancelled'}
                        </Badge>
                      </div>

                      <div className="text-muted small mb-1">
                        🏛️ <strong>{booking.showtime?.theater || 'Cinema Hall'}</strong>
                      </div>
                      <div className="text-muted small">
                        📅 {booking.showtime?.date || 'N/A'} at 🕒 {booking.showtime?.time || 'N/A'}
                      </div>
                    </Col>

                    {/* Seats & Price */}
                    <Col xs={6} sm={4} md={2} lg={3}>
                      <div className="small text-muted mb-1">Reserved Seats:</div>
                      <div className="d-flex gap-1 flex-wrap mb-2">
                        {booking.seats?.map((seat) => (
                          <Badge key={seat} bg="info" text="dark" className="fs-6">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                      <div className="fw-bold text-success fs-5">
                        ₹{booking.totalAmount}
                      </div>
                    </Col>

                    {/* Actions */}
                    <Col xs={6} sm={12} md={2} lg={2} className="text-md-end">
                      {isConfirmed ? (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="w-100"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel Booking
                        </Button>
                      ) : (
                        <span className="text-muted small fst-italic d-block">
                          Cancelled
                        </span>
                      )}
                      <small className="text-muted d-block mt-2" style={{ fontSize: '11px' }}>
                        Booked: {new Date(booking.createdAt).toLocaleDateString()}
                      </small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default MyBookings;
