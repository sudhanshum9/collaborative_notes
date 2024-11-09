// src/components/InviteModal.js
import React, { useState } from 'react';
import axios from 'axios';

const InviteModal = ({ teamId, onClose }) => {
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
      alert("Failed to send invitation.");
    }
  };

  return (
    <div className="modal bg-white p-6 rounded shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Invite a Team Member</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email to invite"
        className="w-full px-4 py-2 mb-4 border rounded-lg"
      />
      <button onClick={handleInvite} className="w-full bg-green-500 text-white py-2 rounded mb-2">Send Invite</button>
      <button onClick={onClose} className="w-full bg-gray-300 py-2 rounded">Close</button>
    </div>
  );
};

export default InviteModal;
