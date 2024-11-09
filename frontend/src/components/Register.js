// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state

    if (password !== rePassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/auth/users/', {
        username,
        email,
        password,
        re_password: rePassword,
      });

      if (response.status === 201) {
        setSuccess(true);
        setUsername('');
        setEmail('');
        setPassword('');
        setRePassword('');
      }
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      {success && <p className="text-green-600">Registration successful! You can now log in.</p>}
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
          placeholder="Confirm Password"
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
