// src/components/InviteModal.js

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const InviteModal = ({ onClose, teamId }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/teams/${teamId}/invite/`, { email }, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (error) {
      console.error("Error sending invite", error);
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Invite to Team</h2>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            onClick={handleInvite} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Send Invite'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
