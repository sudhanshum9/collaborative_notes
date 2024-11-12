// src/components/CreateTeamModal.js
import React, { useState } from 'react';
import axios from 'axios';

const CreateTeamModal = ({ onClose, onTeamCreated }) => {
  const [teamName, setTeamName] = useState('');
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/teams/`, { name: teamName }, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      alert(`Team "${response.data.name}" created successfully!`);
      setTeamName('');
      onClose();
      onTeamCreated(); // Refresh teams in the dashboard after team creation
    } catch (error) {
      console.error('Error creating team', error);
      alert('Failed to create team.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Create a New Team</h3>
        <form onSubmit={handleCreateTeam}>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="w-full px-4 py-2 mb-4 border rounded-lg"
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mb-2">
            Create Team
          </button>
          <button onClick={onClose} className="w-full bg-gray-300 py-2 rounded">
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
