// Seat Selection Page Component
// Interactive 40-seat visual theater grid with real-time price calculation and conflict handling
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ROWS = ['A', 'B', 'C', 'D'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch showtime details
  const fetchShowtime = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get(`/api/showtimes/${showtimeId}`);
      setShowtime(response.data);
    } catch (err) {
      console.error('Error fetching showtime:', err);
      setError('Unable to load showtime details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  // Toggle seat selection
  const handleSeatClick = (seatLabel) => {
    // If seat is already booked, do nothing
    if (showtime.bookedSeats && showtime.bookedSeats.includes(seatLabel)) {
      return;
    }

    if (selectedSeats.includes(seatLabel)) {
      // Deselect
      setSelectedSeats(selectedSeats.filter((s) => s !== seatLabel));
    } else {
      // Select
      setSelectedSeats([...selectedSeats, seatLabel]);
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat to proceed.');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');
      setSuccess('');

      // Send booking request to backend API
      const response = await API.post('/bookings', {
        showtimeId: showtime._id,
        seats: selectedSeats,
      });

      setSuccess('🎉 Booking confirmed successfully! Redirecting to your bookings...');
      setSelectedSeats([]);

      // Redirect to My Bookings after a short delay
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      console.error('Booking failed:', err.response?.data?.message || err.message);
      setError(
        err.response?.data?.message ||
          'Failed to complete booking. One or more seats may have been taken.'
      );
      // Re-fetch showtime to update latest booked seats
      fetchShowtime();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading seat map..." />;
  }

  if (!showtime) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Showtime not found.{' '}
          <Link to="/" className="alert-link">
            Return to Home
          </Link>
        </Alert>
      </Container>
    );
  }

  const totalPrice = selectedSeats.length * showtime.price;

  return (
    <Container className="py-5">
      {/* Breadcrumb / Back button */}
      <Link
        to={showtime.movie ? `/movies/${showtime.movie._id}` : '/'}
        className="btn btn-outline-secondary btn-sm mb-4"
      >
        &larr; Back to Movie Details
      </Link>

      {/* Showtime Overview Banner */}
      <Card className="bg-dark text-white p-4 mb-4 shadow-sm border-0 rounded-3">
        <Row className="align-items-center">
          <Col md={8}>
            <h2 className="fw-bold mb-1 text-warning">{showtime.movie?.title}</h2>
            <p className="text-light mb-0 fs-6">
              🏛️ <strong>{showtime.theater}</strong> &nbsp;|&nbsp; 📅 {showtime.date} &nbsp;|&nbsp; 🕒 {showtime.time}
            </p>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <span className="fs-5 text-light-50">Ticket Price: </span>
            <span className="fs-3 fw-bold text-success">₹{showtime.price}</span>
          </Col>
        </Row>
      </Card>

      {/* Alert Messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-4">
        {/* Left Side: Seat Map */}
        <Col lg={8}>
          <Card className="p-4 shadow-sm border-0 text-center">
            {/* Screen indicator */}
            <div className="screen-container mb-5">
              <div className="cinema-screen shadow-sm">SCREEN THIS WAY</div>
              <small className="text-muted">All eyes facing the front</small>
            </div>

            {/* Seat Grid */}
            <div className="seat-grid d-inline-block mx-auto mb-4">
              {ROWS.map((row) => (
                <div key={row} className="d-flex align-items-center justify-content-center mb-2 gap-2">
                  <span className="fw-bold text-secondary me-2" style={{ width: '20px' }}>
                    {row}
                  </span>
                  {COLS.map((col) => {
                    const seatLabel = `${row}${col}`;
                    const isBooked =
                      showtime.bookedSeats && showtime.bookedSeats.includes(seatLabel);
                    const isSelected = selectedSeats.includes(seatLabel);

                    let btnClass = 'btn-outline-secondary';
                    if (isBooked) {
                      btnClass = 'btn-secondary opacity-50 pe-none';
                    } else if (isSelected) {
                      btnClass = 'btn-success fw-bold text-white shadow-sm';
                    }

                    return (
                      <Button
                        key={seatLabel}
                        size="sm"
                        variant={btnClass.replace('btn-', '')}
                        disabled={isBooked}
                        onClick={() => handleSeatClick(seatLabel)}
                        style={{
                          width: '38px',
                          height: '38px',
                          padding: '0',
                          fontSize: '12px',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                        }}
                        title={isBooked ? `Seat ${seatLabel} (Booked)` : `Seat ${seatLabel}`}
                      >
                        {seatLabel}
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="d-flex justify-content-center gap-4 pt-3 border-top text-secondary small">
              <div className="d-flex align-items-center gap-2">
                <span className="seat-legend-box bg-white border border-secondary"></span>
                <span>Available</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="seat-legend-box bg-success"></span>
                <span>Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="seat-legend-box bg-secondary opacity-50"></span>
                <span>Booked</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Side: Booking Summary */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 sticky-top" style={{ top: '90px' }}>
            <Card.Header className="bg-light fw-bold py-3 fs-5">
              🎟️ Booking Summary
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <span className="text-muted d-block small">Movie</span>
                <strong className="fs-6">{showtime.movie?.title}</strong>
              </div>

              <div className="mb-3">
                <span className="text-muted d-block small">Theater & Showtime</span>
                <div>{showtime.theater}</div>
                <div className="text-muted small">
                  {showtime.date} at {showtime.time}
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <span className="text-muted d-block small">Selected Seats ({selectedSeats.length})</span>
                {selectedSeats.length > 0 ? (
                  <div className="d-flex gap-1 flex-wrap mt-1">
                    {selectedSeats.map((seat) => (
                      <Badge key={seat} bg="success" className="fs-6 px-2 py-1">
                        {seat}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted fst-italic small">No seats selected yet</span>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4 pt-2 border-top">
                <span className="fs-6 text-muted">Total Amount</span>
                <span className="fs-4 fw-bold text-success">₹{totalPrice}</span>
              </div>

              {/* Confirm Booking CTA */}
              <Button
                variant="danger"
                size="lg"
                className="w-100 fw-bold shadow-sm"
                disabled={selectedSeats.length === 0 || bookingLoading}
                onClick={handleBooking}
              >
                {bookingLoading ? (
                  'Processing Booking...'
                ) : user ? (
                  `Confirm Booking (${selectedSeats.length} Seats)`
                ) : (
                  'Login to Confirm Booking'
                )}
              </Button>

              {!user && (
                <p className="text-center text-muted small mt-2 mb-0">
                  You will be prompted to log in before reserving.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SeatSelection;
