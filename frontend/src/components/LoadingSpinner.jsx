// Loading Spinner Component
// Reusable centered spinner with customizable text
import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center my-5 py-5">
      <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted fw-semibold">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
