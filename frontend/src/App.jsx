// Main Application Component
// Configures client-side routing, AuthContext provider, and common layout
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          {/* Global Navigation Bar */}
          <AppNavbar />

          {/* Main Content View */}
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/book/:showtimeId" element={<SeatSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User Protected Route */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-dark text-white-50 text-center py-4 mt-auto border-top border-secondary">
            <div className="container">
              <p className="mb-1 text-light fw-semibold">
                🎬 IMovies - Movie Ticket Booking Web App
              </p>
              <small className="text-secondary">
                BTech CS Final Project &bull; Built with MERN Stack (MongoDB, Express, React, Node.js)
              </small>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
