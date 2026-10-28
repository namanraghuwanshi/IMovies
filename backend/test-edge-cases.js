// Edge Cases & Security Test Suite for IMovies
const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const reqData = body ? JSON.stringify(body) : null;
    if (reqData) headers['Content-Length'] = Buffer.byteLength(reqData);

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

async function runEdgeCaseTests() {
  console.log('=== RUNNING EDGE CASES & SEAT AVAILABILITY TESTS ===\n');

  // 1. Login user 1
  const u1 = await request('POST', '/api/auth/login', {
    email: 'user@imovies.com',
    password: 'user123',
  });
  const token1 = u1.data.token;

  // 2. Register user 2 (attacker/other user)
  const otherEmail = `other_${Date.now()}@test.com`;
  const u2 = await request('POST', '/api/auth/register', {
    name: 'Other User',
    email: otherEmail,
    password: 'password123',
  });
  const token2 = u2.data.token;

  // 3. Get a showtime
  const moviesRes = await request('GET', '/api/movies');
  const movieId = moviesRes.data[0]._id;
  const showtimesRes = await request('GET', `/api/movies/${movieId}/showtimes`);
  const showtime = showtimesRes.data[1]; // Use second showtime

  // 4. Test unauthorized booking (no token) -> 401
  const noTokenRes = await request('POST', '/api/bookings', {
    showtimeId: showtime._id,
    seats: ['D1'],
  });
  console.log(
    noTokenRes.status === 401 ? '[PASS]' : '[FAIL]',
    'Reject booking without token (Status 401)'
  );

  // 5. User 1 books seat D1 & D2 -> 201
  const bookRes = await request(
    'POST',
    '/api/bookings',
    { showtimeId: showtime._id, seats: ['D1', 'D2'] },
    token1
  );
  console.log(
    bookRes.status === 201 ? '[PASS]' : '[FAIL]',
    'User 1 successfully books seats D1 and D2 (Status 201)'
  );
  const bookingId = bookRes.data._id;

  // 6. User 2 attempts to double-book D1 -> 400
  const doubleBookRes = await request(
    'POST',
    '/api/bookings',
    { showtimeId: showtime._id, seats: ['D1', 'D3'] },
    token2
  );
  console.log(
    doubleBookRes.status === 400 && doubleBookRes.data.message.includes('already booked')
      ? '[PASS]'
      : '[FAIL]',
    'Prevent double booking of seat D1 (Status 400 with conflict message)'
  );

  // 7. User 2 tries to cancel User 1\'s booking -> 403 Forbidden
  const evilCancelRes = await request(
    'PUT',
    `/api/bookings/${bookingId}/cancel`,
    null,
    token2
  );
  console.log(
    evilCancelRes.status === 403 ? '[PASS]' : '[FAIL]',
    'Prevent user from cancelling another user\'s booking (Status 403)'
  );

  // 8. User 1 cancels own booking -> 200
  const validCancelRes = await request(
    'PUT',
    `/api/bookings/${bookingId}/cancel`,
    null,
    token1
  );
  console.log(
    validCancelRes.status === 200 && validCancelRes.data.booking.status === 'cancelled'
      ? '[PASS]'
      : '[FAIL]',
    'User 1 cancels own booking (Status 200)'
  );

  // 9. Re-check showtime: verify seats D1 and D2 are released
  const refreshedShowtime = await request('GET', `/api/showtimes/${showtime._id}`);
  const hasD1 = refreshedShowtime.data.bookedSeats.includes('D1');
  const hasD2 = refreshedShowtime.data.bookedSeats.includes('D2');
  console.log(
    !hasD1 && !hasD2 ? '[PASS]' : '[FAIL]',
    'Seats D1 and D2 are released in showtime document'
  );

  // 10. Attempt to cancel already cancelled booking -> 400
  const repeatCancel = await request(
    'PUT',
    `/api/bookings/${bookingId}/cancel`,
    null,
    token1
  );
  console.log(
    repeatCancel.status === 400 ? '[PASS]' : '[FAIL]',
    'Prevent re-cancelling an already cancelled booking (Status 400)'
  );

  // 11. User 2 can now successfully book the released seat D1 -> 201
  const rebookRes = await request(
    'POST',
    '/api/bookings',
    { showtimeId: showtime._id, seats: ['D1'] },
    token2
  );
  console.log(
    rebookRes.status === 201 ? '[PASS]' : '[FAIL]',
    'Released seat D1 can now be successfully booked by User 2 (Status 201)'
  );

  console.log('\n=== EDGE CASES TESTS COMPLETED SUCCESSFULLY ===\n');
}

runEdgeCaseTests();
