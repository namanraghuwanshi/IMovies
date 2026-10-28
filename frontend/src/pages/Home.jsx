// Home Page Component
// Displays movie catalog with real-time search and genre filtering
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Button, Alert } from 'react-bootstrap';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Animation', 'Drama', 'Comedy', 'Thriller'];

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Fetch movies from API with optional search and genre filter
  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/movies';
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (selectedGenre && selectedGenre !== 'All') {
        params.append('genre', selectedGenre);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await API.get(url);
      setMovies(response.data);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Unable to load movies. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever selectedGenre or debounced search changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMovies();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedGenre]);

  return (
    <div className="pb-5">
      {/* Hero Banner */}
      <div className="bg-dark text-white py-5 mb-4 shadow-sm text-center">
        <Container>
          <h1 className="display-5 fw-bold mb-2">🎬 Welcome to IMovies</h1>
          <p className="lead text-light-50 mb-0">
            Browse movies, pick your preferred showtime, and reserve your seats instantly.
          </p>
        </Container>
      </div>

      <Container>
        {/* Search & Filter Toolbar */}
        <Row className="mb-4 g-3 align-items-center">
          {/* Search Input */}
          <Col md={7}>
            <InputGroup>
              <InputGroup.Text className="bg-white">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search movies by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                  Clear
                </Button>
              )}
            </InputGroup>
          </Col>

          {/* Genre Filter Dropdown */}
          <Col md={5}>
            <Form.Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              aria-label="Filter by genre"
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  Genre: {genre}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Loading Spinner */}
        {loading ? (
          <LoadingSpinner text="Fetching latest movies..." />
        ) : movies.length === 0 ? (
          /* Empty State */
          <div className="text-center py-5 bg-light rounded-3 my-4">
            <h4 className="text-muted">No movies found</h4>
            <p className="text-secondary">Try searching for a different title or resetting the genre filter.</p>
            <Button
              variant="outline-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('All');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          /* Movie Cards Grid */
          <Row xs={1} sm={2} md={3} lg={3} className="g-4">
            {movies.map((movie) => (
              <Col key={movie._id}>
                <Card className="h-100 shadow-sm border-0 movie-card overflow-hidden">
                  <div className="position-relative" style={{ height: '340px', backgroundColor: '#1a1a1a' }}>
                    <Card.Img
                      variant="top"
                      src={movie.posterUrl}
                      alt={movie.title}
                      style={{ height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
                      }}
                    />
                    <Badge
                      bg="warning"
                      text="dark"
                      className="position-absolute top-0 end-0 m-2 fs-6 fw-bold shadow-sm"
                    >
                      ⭐ {movie.rating?.toFixed(1) || 'N/A'}
                    </Badge>
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="fw-bold fs-5 mb-1">{movie.title}</Card.Title>

                    {/* Metadata Badges */}
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      <Badge bg="secondary">{movie.genre}</Badge>
                      <Badge bg="info" text="dark">
                        {movie.language}
                      </Badge>
                      <span className="text-muted small">⏱️ {movie.duration} mins</span>
                    </div>

                    <Card.Text className="text-muted small flex-grow-1">
                      {movie.description?.length > 110
                        ? `${movie.description.substring(0, 110)}...`
                        : movie.description}
                    </Card.Text>

                    <Button
                      as={Link}
                      to={`/movies/${movie._id}`}
                      variant="danger"
                      className="w-100 fw-semibold mt-2"
                    >
                      View Showtimes & Book
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Home;
