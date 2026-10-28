// Automated Test Suite for IMovies API Endpoints
const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const reqData = body ? JSON.stringify(body) : null;
    if (reqData) {
      headers['Content-Length'] = Buffer.byteLength(reqData);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data;
          try {
            data = JSON.parse(raw);
          } catch (e) {
            data = raw;
          }
          resolve({ status: res.statusCode, data });
        });
      }
    );

    req.on('error', reject);
    if (reqData) req.write(reqData);
    req.end();
  });
};

async function runTests() {
  console.log('=== STARTING IMOVIES BACKEND API TESTS ===\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const rootRes = await request('GET', '/');
    assert(rootRes.status === 200, 'GET / returns 200 OK');

    // 2. Auth: Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@imovies.com',
      password: 'admin123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'POST /api/auth/login (Admin)');
    const adminToken = adminLogin.data.token;

    // 3. Auth: User Login
    const userLogin = await request('POST', '/api/auth/login', {
      email: 'user@imovies.com',
      password: 'user123',
    });
    assert(userLogin.status === 200 && userLogin.data.token, 'POST /api/auth/login (User)');
    const userToken = userLogin.data.token;

    // 4. Auth: Register new test user
    const uniqueEmail = `testuser_${Date.now()}@test.com`;
    const registerRes = await request('POST', '/api/auth/register', {
      name: 'Tester Doe',
      email: uniqueEmail,
      password: 'password123',
    });
    assert(registerRes.status === 201 && registerRes.data.token, 'POST /api/auth/register');

    // 5. Auth: GET /api/auth/me (Protected)
    const meRes = await request('GET', '/api/auth/me', null, userToken);
    assert(meRes.status === 200 && meRes.data.email === 'user@imovies.com', 'GET /api/auth/me (Valid Token)');

    const meUnauthorized = await request('GET', '/api/auth/me');
    assert(meUnauthorized.status === 401, 'GET /api/auth/me (Missing Token -> 401)');

    // 6. Movies: GET /api/movies
    const moviesRes = await request('GET', '/api/movies');
    assert(moviesRes.status === 200 && Array.isArray(moviesRes.data) && moviesRes.data.length > 0, 'GET /api/movies');
    const firstMovie = moviesRes.data[0];

    // 7. Movies: GET /api/movies/:id
    const singleMovieRes = await request('GET', `/api/movies/${firstMovie._id}`);
    assert(singleMovieRes.status === 200 && singleMovieRes.data._id === firstMovie._id, 'GET /api/movies/:id');

    // 8. Movies: POST /api/movies (Admin only)
    const newMovieData = {
      title: 'Gladiator II',
      description: 'Years after witnessing the death of Maximus, Lucius must enter the Colosseum.',
      genre: 'Action',
      language: 'English',
      duration: 148,
      rating: 8.0,
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
      releaseDate: '2024-11-22',
    };
    const createMovieUser = await request('POST', '/api/movies', newMovieData, userToken);
    assert(createMovieUser.status === 403, 'POST /api/movies as User -> 403 Forbidden');

    const createMovieAdmin = await request('POST', '/api/movies', newMovieData, adminToken);
    assert(createMovieAdmin.status === 201 && createMovieAdmin.data._id, 'POST /api/movies as Admin -> 201 Created');
    const createdMovieId = createMovieAdmin.data._id;

    // 9. Movies: PUT /api/movies/:id (Admin only)
    const updateMovieRes = await request('PUT', `/api/movies/${createdMovieId}`, { rating: 8.5 }, adminToken);
    assert(updateMovieRes.status === 200 && updateMovieRes.data.rating === 8.5, 'PUT /api/movies/:id (Update Movie)');

    // 10. Showtimes: GET /api/movies/:id/showtimes
    const movieShowtimesRes = await request('GET', `/api/movies/${firstMovie._id}/showtimes`);
    assert(movieShowtimesRes.status === 200 && Array.isArray(movieShowtimesRes.data), 'GET /api/movies/:id/showtimes');
    const testShowtime = movieShowtimesRes.data[0];

    // 11. Showtimes: POST /api/showtimes (Admin only)
    const newShowtimeData = {
      movie: createdMovieId,
      theater: 'PVR Gold Class',
      date: '2026-11-01',
      time: '08:00 PM',
      price: 450,
      totalSeats: 40,
    };
    const createShowtimeRes = await request('POST', '/api/showtimes', newShowtimeData, adminToken);
    assert(createShowtimeRes.status === 201 && createShowtimeRes.data._id, 'POST /api/showtimes (Admin)');

    // 12. Showtimes: GET /api/showtimes/:id
    const showtimeDetailRes = await request('GET', `/api/showtimes/${testShowtime._id}`);
    assert(showtimeDetailRes.status === 200 && showtimeDetailRes.data.movie, 'GET /api/showtimes/:id (Populated)');

    // 13. Bookings: Real-time conflict check (Book a seat, then try to re-book it)
    await request(
      'POST',
      '/api/bookings',
      { showtimeId: testShowtime._id, seats: ['B1'] },
      userToken
    );

    const conflictBooking = await request(
      'POST',
      '/api/bookings',
      { showtimeId: testShowtime._id, seats: ['B1'] },
      userToken
    );
    assert(conflictBooking.status === 400, 'POST /api/bookings with already booked seat -> 400 Conflict Error');

    // 14. Bookings: Successful booking
    const availableSeat = ['C3', 'C4'];
    const validBooking = await request(
      'POST',
      '/api/bookings',
      { showtimeId: testShowtime._id, seats: availableSeat },
      userToken
    );
    assert(validBooking.status === 201 && validBooking.data._id, 'POST /api/bookings successful -> 201');
    const newBookingId = validBooking.data._id;

    // Verify seat is now recorded in showtime
    const updatedShowtime = await request('GET', `/api/showtimes/${testShowtime._id}`);
    assert(
      updatedShowtime.data.bookedSeats.includes('C3') && updatedShowtime.data.bookedSeats.includes('C4'),
      'Showtime bookedSeats updated in real-time'
    );

    // 15. Bookings: GET /api/bookings/my
    const myBookingsRes = await request('GET', '/api/bookings/my', null, userToken);
    assert(myBookingsRes.status === 200 && myBookingsRes.data.length >= 2, 'GET /api/bookings/my');

    // 16. Bookings: User cancelling own booking
    const cancelRes = await request('PUT', `/api/bookings/${newBookingId}/cancel`, null, userToken);
    assert(cancelRes.status === 200 && cancelRes.data.booking.status === 'cancelled', 'PUT /api/bookings/:id/cancel');

    // Verify seats were released in showtime
    const showtimeAfterCancel = await request('GET', `/api/showtimes/${testShowtime._id}`);
    assert(
      !showtimeAfterCancel.data.bookedSeats.includes('C3'),
      'Seats released back to showtime after cancellation'
    );

    // 17. Bookings: GET /api/bookings (Admin Only)
    const adminAllBookings = await request('GET', '/api/bookings', null, adminToken);
    assert(adminAllBookings.status === 200 && Array.isArray(adminAllBookings.data), 'GET /api/bookings (Admin Only)');

    const userAllBookings = await request('GET', '/api/bookings', null, userToken);
    assert(userAllBookings.status === 403, 'GET /api/bookings as User -> 403 Forbidden');

    // 18. Clean up created movie
    const deleteMovieRes = await request('DELETE', `/api/movies/${createdMovieId}`, null, adminToken);
    assert(deleteMovieRes.status === 200, 'DELETE /api/movies/:id (Admin)');

    console.log(`\n======================================`);
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
