// src/components/InviteModal.js

import React, { useState } from 'react';
import axios from 'axios';

const InviteModal = ({ onClose, teamId }) => {
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    try {
      await axios.post(`http://localhost:8000/api/teams/${teamId}/invite/`, { email }, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      alert(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (error) {
      console.error("Error sending invite", error);
      alert("Failed to send invitation");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Invite to Team</h2>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
        />
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={handleInvite} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
