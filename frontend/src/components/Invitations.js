// src/components/Invitations.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);

  // Fetch pending invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/invitations/', {
          headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        setInvitations(response.data);
      } catch (error) {
        console.error("Error fetching invitations", error);
      }
    };

    fetchInvitations();
  }, []);

  // Handle accepting an invitation
  const handleAcceptInvitation = async (invitationId) => {
    try {
      await axios.post(`http://localhost:8000/api/invitations/${invitationId}/accept/`, {}, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      alert("Invitation accepted!");
      setInvitations(invitations.filter((inv) => inv.id !== invitationId)); // Remove accepted invitation from the list
    } catch (error) {
      console.error("Error accepting invitation", error);
      alert("Failed to accept invitation.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Pending Invitations</h2>
      {invitations.length === 0 ? (
        <p>No pending invitations.</p>
      ) : (
        <ul>
          {invitations.map((inv) => (
            <li key={inv.id} className="mb-4 p-4 bg-white shadow-md rounded-lg">
              <p>Invitation to join team: <strong>{inv.team}</strong></p>
              <button
                onClick={() => handleAcceptInvitation(inv.id)}
                className="bg-blue-500 text-white py-1 px-4 rounded mt-2"
              >
                Accept
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Invitations;
