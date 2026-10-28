// Admin Dashboard Component
// Administrative control panel to manage movies, create showtimes, and inspect all bookings
import React, { useState, useEffect } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Modal,
} from 'react-bootstrap';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const initialMovieForm = {
  title: '',
  description: '',
  genre: 'Action',
  language: 'English',
  duration: 120,
  rating: 8.0,
  posterUrl: '',
  releaseDate: new Date().toISOString().split('T')[0],
};

const initialShowtimeForm = {
  movie: '',
  theater: '',
  date: '',
  time: '06:00 PM',
  price: 250,
  totalSeats: 40,
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies');

  // Data states
  const [movies, setMovies] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alerts
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Movie Form State (Modal)
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [movieForm, setMovieForm] = useState(initialMovieForm);

  // Showtime Form State
  const [showtimeForm, setShowtimeForm] = useState(initialShowtimeForm);

  // Fetch all administrative data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesRes, bookingsRes] = await Promise.all([
        API.get('/movies'),
        API.get('/bookings'),
      ]);
      setMovies(moviesRes.data);
      setAllBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setFeedback({
        type: 'danger',
        message: 'Failed to load admin data. Make sure you have admin rights.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modal to add a new movie
  const handleOpenAddModal = () => {
    setEditingMovieId(null);
    setMovieForm(initialMovieForm);
    setShowMovieModal(true);
  };

  // Open modal to edit existing movie
  const handleOpenEditModal = (movie) => {
    setEditingMovieId(movie._id);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      language: movie.language,
      duration: movie.duration,
      rating: movie.rating,
      posterUrl: movie.posterUrl,
      releaseDate: movie.releaseDate
        ? new Date(movie.releaseDate).toISOString().split('T')[0]
        : '',
    });
    setShowMovieModal(true);
  };

  // Handle Add/Edit Movie Submit
  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMovieId) {
        // Update movie
        const res = await API.put(`/movies/${editingMovieId}`, movieForm);
        setMovies(movies.map((m) => (m._id === editingMovieId ? res.data : m)));
        setFeedback({ type: 'success', message: 'Movie updated successfully!' });
      } else {
        // Create movie
        const res = await API.post('/movies', movieForm);
        setMovies([res.data, ...movies]);
        setFeedback({ type: 'success', message: 'Movie added successfully!' });
      }
      setShowMovieModal(false);
      setMovieForm(initialMovieForm);
    } catch (err) {
      console.error('Movie save error:', err);
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to save movie.',
      });
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie and all its showtimes?')) {
      return;
    }

    try {
      await API.delete(`/movies/${movieId}`);
      setMovies(movies.filter((m) => m._id !== movieId));
      setFeedback({ type: 'success', message: 'Movie deleted successfully!' });
    } catch (err) {
      console.error('Delete movie error:', err);
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to delete movie.',
      });
    }
  };

  // Handle Add Showtime Submit
  const handleShowtimeSubmit = async (e) => {
    e.preventDefault();
    if (!showtimeForm.movie) {
      setFeedback({ type: 'danger', message: 'Please select a movie for the showtime.' });
      return;
    }

    try {
      await API.post('/showtimes', showtimeForm);
      setFeedback({ type: 'success', message: 'Showtime created successfully!' });
      setShowtimeForm(initialShowtimeForm);
    } catch (err) {
      console.error('Create showtime error:', err);
      setFeedback({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to create showtime.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Admin Dashboard..." />;
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">⚙️ Admin Dashboard</h2>
          <p className="text-muted small mb-0">Manage movie catalogue, showtimes, and customer reservations</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleOpenAddModal}>
          + Add New Movie
        </Button>
      </div>

      {/* Global Feedback Alert */}
      {feedback.message && (
        <Alert
          variant={feedback.type}
          dismissible
          onClose={() => setFeedback({ type: '', message: '' })}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Dashboard Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        justify
      >
        {/* TAB 1: Manage Movies */}
        <Tab eventKey="movies" title={`🎬 Movies (${movies.length})`}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Language</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie._id}>
                      <td style={{ width: '60px' }}>
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="rounded"
                          style={{ width: '45px', height: '60px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
                          }}
                        />
                      </td>
                      <td className="fw-bold">{movie.title}</td>
                      <td>
                        <Badge bg="secondary">{movie.genre}</Badge>
                      </td>
                      <td>{movie.language}</td>
                      <td>{movie.duration} mins</td>
                      <td>
                        <span className="text-warning fw-bold">⭐ {movie.rating}</span>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenEditModal(movie)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteMovie(movie._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 2: Add Showtime */}
        <Tab eventKey="showtimes" title="➕ Add Showtime">
          <Card className="border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3">Schedule a New Showtime</h5>
            <Form onSubmit={handleShowtimeSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="showtimeMovie">
                    <Form.Label className="fw-semibold small">Select Movie</Form.Label>
                    <Form.Select
                      value={showtimeForm.movie}
                      onChange={(e) =>
                        setShowtimeForm({ ...showtimeForm, movie: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Choose Movie --</option>
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title} ({m.language})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="theaterName">
                    <Form.Label className="fw-semibold small">Theater / Screen Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. PVR Cinemas, Screen 2"
                      value={showtimeForm.theater}
                      onChange={(e) =>
                        setShowtimeForm({ ...showtimeForm, theater: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group controlId="showDate">
                    <Form.Label className="fw-semibold small">Date (YYYY-MM-DD)</Form.Label>
                    <Form.Control
                      type="date"
                      value={showtimeForm.date}
                      onChange={(e) =>
                        setShowtimeForm({ ...showtimeForm, date: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group controlId="showTime">
                    <Form.Label className="fw-semibold small">Time (e.g. 06:30 PM)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 02:30 PM or 07:00 PM"
                      value={showtimeForm.time}
                      onChange={(e) =>
                        setShowtimeForm({ ...showtimeForm, time: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group controlId="ticketPrice">
                    <Form.Label className="fw-semibold small">Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={showtimeForm.price}
                      onChange={(e) =>
                        setShowtimeForm({ ...showtimeForm, price: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group controlId="totalSeats">
                    <Form.Label className="fw-semibold small">Total Seats</Form.Label>
                    <Form.Control
                      type="number"
                      min="10"
                      max="100"
                      value={showtimeForm.totalSeats}
                      onChange={(e) =>
                        setShowtimeForm({ ...showtimeForm, totalSeats: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4 text-end">
                <Button variant="danger" type="submit" className="px-4 fw-semibold">
                  Schedule Showtime
                </Button>
              </div>
            </Form>
          </Card>
        </Tab>

        {/* TAB 3: All Customer Bookings */}
        <Tab eventKey="bookings" title={`📋 All Bookings (${allBookings.length})`}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Movie</th>
                    <th>Theater</th>
                    <th>Date & Time</th>
                    <th>Seats</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date Booked</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <strong>{b.user?.name || 'Unknown'}</strong>
                        <div className="small text-muted">{b.user?.email || 'N/A'}</div>
                      </td>
                      <td className="fw-semibold">{b.showtime?.movie?.title || 'N/A'}</td>
                      <td>{b.showtime?.theater || 'N/A'}</td>
                      <td>
                        <small>
                          {b.showtime?.date} at {b.showtime?.time}
                        </small>
                      </td>
                      <td>
                        {b.seats?.map((seat) => (
                          <Badge key={seat} bg="info" text="dark" className="me-1">
                            {seat}
                          </Badge>
                        ))}
                      </td>
                      <td className="fw-bold text-success">₹{b.totalAmount}</td>
                      <td>
                        <Badge bg={b.status === 'confirmed' ? 'success' : 'secondary'}>
                          {b.status}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Add / Edit Movie Modal */}
      <Modal show={showMovieModal} onHide={() => setShowMovieModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {editingMovieId ? 'Edit Movie' : 'Add New Movie'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleMovieSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group controlId="movieTitle">
                  <Form.Label className="small fw-semibold">Movie Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Inception"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="movieDescription">
                  <Form.Label className="small fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter storyline or overview"
                    value={movieForm.description}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, description: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="movieGenre">
                  <Form.Label className="small fw-semibold">Genre</Form.Label>
                  <Form.Select
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                  >
                    <option value="Action">Action</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Animation">Animation</option>
                    <option value="Drama">Drama</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Thriller">Thriller</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="movieLanguage">
                  <Form.Label className="small fw-semibold">Language</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. English, Hindi"
                    value={movieForm.language}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, language: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="movieDuration">
                  <Form.Label className="small fw-semibold">Duration (Mins)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={movieForm.duration}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, duration: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group controlId="movieRating">
                  <Form.Label className="small fw-semibold">Rating (0 - 10)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={movieForm.rating}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, rating: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group controlId="moviePoster">
                  <Form.Label className="small fw-semibold">Poster Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://..."
                    value={movieForm.posterUrl}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, posterUrl: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="movieReleaseDate">
                  <Form.Label className="small fw-semibold">Release Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={movieForm.releaseDate}
                    onChange={(e) =>
                      setMovieForm({ ...movieForm, releaseDate: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMovieModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" className="fw-semibold">
              {editingMovieId ? 'Update Movie' : 'Save Movie'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
