import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Register';
import Dashboard from './pages/Dashboard'; // Assuming you have a Dashboard component for logged-in users
import ProtectedRoute from './components/ProtectedRoute'; // For handling protected routes
import Invitations from './components/Invitations';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Protected route for dashboard or other authenticated pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/invitations" element={
            <ProtectedRoute>
              <Invitations />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
