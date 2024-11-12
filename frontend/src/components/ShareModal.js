// src/components/ShareModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShareModal = ({ note, onClose, onShare }) => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchTeamsAndUsers = async () => {
      try {
        const teamResponse = await axios.get(`${API_BASE_URL}/api/teams/`, {
          headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        const userResponse = await axios.get(`${API_BASE_URL}/api/users/`, {
          headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        setTeams(teamResponse.data);
        setUsers(userResponse.data);
      } catch (error) {
        console.error("Error fetching teams or users", error);
      }
    };
    fetchTeamsAndUsers();
  }, []);

  const handleShareWithTeam = async () => {
    try {
      await onShare(note.id, { team_id: selectedTeam }, "team");
      alert("Note shared with team!");
      onClose();
    } catch (error) {
      console.error("Error sharing with team", error);
      alert("Failed to share with team.");
    }
  };

  const handleShareWithUser = async () => {
    try {
      await onShare(note.id, { user_id: selectedUser }, "user");
      alert("Note shared with user!");
      onClose();
    } catch (error) {
      console.error("Error sharing with user", error);
      alert("Failed to share with user.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Share Note: {note.title}</h3>
        
        <label className="block mb-2">Share with Team:</label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg"
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <button onClick={handleShareWithTeam} className="w-full bg-blue-500 text-white py-2 rounded mb-4">Share with Team</button>

        <label className="block mb-2">Share with User:</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg"
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <button onClick={handleShareWithUser} className="w-full bg-green-500 text-white py-2 rounded mb-4">Share with User</button>

        <button onClick={onClose} className="w-full bg-gray-300 py-2 rounded">Close</button>
      </div>
    </div>
  );
};

export default ShareModal;
