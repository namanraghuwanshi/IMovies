// Movie Details Page Component
// Displays complete movie synopsis and available showtimes with booking links
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      try {
        setLoading(true);
        setError('');

        // Parallel requests for movie info and its showtimes
        const [movieRes, showtimesRes] = await Promise.all([
          API.get(`/movies/${id}`),
          API.get(`/movies/${id}/showtimes`),
        ]);

        setMovie(movieRes.data);
        setShowtimes(showtimesRes.data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie information or showtimes.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading movie information..." />;
  }

  if (error || !movie) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error || 'Movie not found.'}</p>
          <Button as={Link} to="/" variant="outline-danger">
            Back to Home
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Back button */}
      <Link to="/" className="btn btn-outline-secondary btn-sm mb-4">
        &larr; Back to Movies
      </Link>

      {/* Movie Information Header */}
      <Row className="mb-5 g-4 align-items-start">
        {/* Poster */}
        <Col md={4} lg={3}>
          <Card className="shadow border-0 overflow-hidden rounded-3">
            <Card.Img
              src={movie.posterUrl}
              alt={movie.title}
              style={{ width: '100%', height: '380px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
              }}
            />
          </Card>
        </Col>

        {/* Details */}
        <Col md={8} lg={9}>
          <div className="d-flex align-items-center gap-3 flex-wrap mb-2">
            <h1 className="fw-bold mb-0">{movie.title}</h1>
            <Badge bg="warning" text="dark" className="fs-6 py-2 px-3 fw-bold">
              ⭐ {movie.rating?.toFixed(1) || 'N/A'} / 10
            </Badge>
          </div>

          <div className="d-flex gap-2 flex-wrap mb-3">
            <Badge bg="danger" className="px-2 py-1 fs-6">
              {movie.genre}
            </Badge>
            <Badge bg="secondary" className="px-2 py-1 fs-6">
              {movie.language}
            </Badge>
            <span className="text-muted fw-semibold align-self-center">
              ⏱️ {movie.duration} minutes
            </span>
            <span className="text-muted align-self-center">
              📅 Released: {new Date(movie.releaseDate).toLocaleDateString()}
            </span>
          </div>

          <h5 className="fw-bold text-dark mt-4">Overview</h5>
          <p className="text-secondary lead fs-6" style={{ lineHeight: '1.7' }}>
            {movie.description}
          </p>
        </Col>
      </Row>

      {/* Showtimes Section */}
      <div className="mt-4 pt-3 border-top">
        <h3 className="fw-bold mb-4">🎟️ Available Showtimes</h3>

        {showtimes.length === 0 ? (
          <Alert variant="info" className="py-4 text-center">
            <h5>No Showtimes Currently Scheduled</h5>
            <p className="mb-0 text-muted">
              Check back soon or explore other movies on the home page.
            </p>
          </Alert>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-3">
            {showtimes.map((showtime) => {
              const availableSeats =
                showtime.totalSeats - (showtime.bookedSeats ? showtime.bookedSeats.length : 0);

              return (
                <Col key={showtime._id}>
                  <Card className="h-100 shadow-sm border showtime-card">
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold text-danger mb-0">{showtime.theater}</h6>
                        <Badge bg="success" className="fs-6">
                          ₹{showtime.price}
                        </Badge>
                      </div>

                      <div className="mb-3 text-muted small">
                        <div>📅 Date: <strong>{showtime.date}</strong></div>
                        <div>🕒 Time: <strong>{showtime.time}</strong></div>
                        <div className="mt-1">
                          🪑 Available Seats:{' '}
                          <span className={availableSeats > 5 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                            {availableSeats} / {showtime.totalSeats}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        {availableSeats > 0 ? (
                          <Button
                            as={Link}
                            to={`/book/${showtime._id}`}
                            variant="primary"
                            className="w-100 fw-semibold"
                          >
                            Select Seats
                          </Button>
                        ) : (
                          <Button variant="secondary" className="w-100 fw-semibold" disabled>
                            Housefull
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </Container>
  );
};

export default MovieDetails;
