// src/components/Dashboard.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ShareModal from '../components/ShareModal';
import InviteModal from '../components/InviteModal';
import CreateTeamModal from '../components/CreateTeamModal';
import { FiPlus, FiEdit2, FiShare2, FiTrash2, FiLogOut, FiMenu } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8001';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [ws, setWs] = useState(null);

  // Add new category
  const handleAddCategory = async () => {
    if (newCategory) {
      try {
        const response = await axios.post(`${API_URL}/api/categories/`, 
          { name: newCategory },
          { headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` }}
        );
        setCategories([...categories, response.data]);
        setNewCategory('');
        setCategoryModalOpen(false);
        toast.success('Category added successfully');
      } catch (error) {
        toast.error('Error adding category');
      }
    }
  };

  const filteredNotes = notes.filter(note => {
    if (selectedCategoryFilter === 'all') return true;
    return note.category == selectedCategoryFilter;
  });

  // Memoized fetch functions
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/profile/`, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      setUser(response.data);
    } catch (error) {
      toast.error("Error fetching user profile");
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notes/`, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      setNotes(response.data);
    } catch (error) {
      toast.error("Error fetching notes");
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories/`, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      setCategories(response.data);
    } catch (error) {
      toast.error("Error fetching categories");
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/teams/`, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      setTeams(response.data);
    } catch (error) {
      if (error.code === 'ERR_CONNECTION_REFUSED') {
        toast.error("Unable to connect to server. Please check if the server is running.");
      } else {
        toast.error("Error fetching teams");
      }
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/invitations/`, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      setInvitations(response.data);
    } catch (error) {
      toast.error("Error fetching invitations");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchNotes(),
        fetchTeams(),
        fetchInvitations(),
        fetchCategories()
      ]);
      setIsLoading(false);
    };
    fetchData();

    const websocket = new WebSocket(`${WS_URL}/ws/notes/`);
    setWs(websocket);
    
    websocket.onopen = () => {
      setWsConnected(true);
      toast.success('Real-time updates connected');
    };

    websocket.onclose = () => {
      setWsConnected(false);
      toast.warning('Real-time updates disconnected. Reconnecting...');
      setTimeout(() => {
        const newWs = new WebSocket(`${WS_URL}/ws/notes/`);
        setWs(newWs);
      }, 3000);
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log({data})
      const { type, id, title, content } = data;
      console.log({type,id,title,content})  
      switch(type) {
        case 'note_deleted':
          setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
          toast.info('Note deleted in real-time');
          break;
        case 'note_update':
          setNotes(prevNotes => 
            prevNotes.map(note => 
              note.id === id 
                ? { ...note, title, content }
                : note
            )
          );
          toast.info('Note updated in real-time');
          break;
        case 'note_share':
          fetchNotes();
          toast.info('Note shared in real-time');
          break;
        case 'team_invite':
          fetchInvitations();
          toast.info('New team invitation received');
          break;
        default:
          break;
      }
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [fetchUserProfile, fetchNotes, fetchTeams, fetchInvitations, fetchCategories]);

  const sendWebSocketMessage = (type, payload) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  const handleAddOrUpdateNote = async (e) => {
    e.preventDefault();
    const noteData = { title, content, category };
    try {
      if (editingNote) {
        const response = await axios.put(`${API_URL}/api/notes/${editingNote.id}/`, noteData, {
          headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        setNotes(notes.map((note) => (note.id === editingNote.id ? response.data : note)));
        sendWebSocketMessage('NOTE_UPDATED', response.data);
        toast.success('Note updated successfully');
      } else {
        const response = await axios.post(`${API_URL}/api/notes/`, noteData, {
          headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        setNotes([...notes, response.data]);
        sendWebSocketMessage('NOTE_UPDATED', response.data);
        toast.success('Note created successfully');
      }
      setTitle('');
      setContent('');
      setCategory('');
      setNoteModalOpen(false);
      setEditingNote(null);
    } catch (error) {
      toast.error('Error saving note');
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || '');
    setNoteModalOpen(true);
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/api/notes/${noteToDelete.id}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      
      sendWebSocketMessage('NOTE_DELETED', { id: noteToDelete.id });
      
      setNotes(notes.filter((note) => note.id !== noteToDelete.id));
      setDeleteModalOpen(false);
      setNoteToDelete(null);
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Error deleting note');
    }
  };

  const handleShareClick = (note) => {
    setSelectedNote(note);
    setShareModalOpen(true);
  };

  const handleShare = async (noteId, data, type) => {
    try {
      const endpoint = type === "team"
        ? `${API_URL}/api/notes/${noteId}/share_with_team/`
        : `${API_URL}/api/notes/${noteId}/share_with_user/`;
      const response = await axios.post(endpoint, data, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      
      sendWebSocketMessage('NOTE_SHARED', response.data);
      
      await fetchNotes();
      setShareModalOpen(false);
      toast.success(`Note shared with ${type} successfully`);
    } catch (error) {
      toast.error(`Failed to share with ${type}`);
    }
  };

  const handleInviteMember = (teamId) => {
    setSelectedTeamId(teamId);
    setInviteModalOpen(true);
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await axios.post(`${API_URL}/api/invitations/${inviteId}/accept/`, {}, {
        headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
      });
      setInvitations(invitations.filter((invite) => invite.id !== inviteId));
      await fetchTeams();
      sendWebSocketMessage('TEAM_INVITE_ACCEPTED', { inviteId });
      toast.success('Invitation accepted successfully');
    } catch (error) {
      toast.error('Failed to accept invitation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transform transition-transform duration-200 ease-in-out fixed md:static w-64 bg-blue-600 text-white min-h-screen p-4 shadow-lg z-40`}>
        {/* User Profile Section */}
        {user && (
          <div className="mb-8 p-4 bg-blue-700 rounded-lg shadow-inner">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold">{user.username[0].toUpperCase()}</span>
            </div>
            <h2 className="text-xl font-bold text-center">{user.username}</h2>
            <p className="text-blue-200 text-sm text-center">{user.email}</p>
          </div>
        )}
        
        {/* Teams Section */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span>Teams</span>
            <button 
              onClick={() => setTeamModalOpen(true)}
              className="ml-auto p-1 hover:bg-blue-500 rounded-full transition-colors"
              title="Create Team"
            >
              <FiPlus />
            </button>
          </h3>
          <div className="space-y-2">
            {teams.map(team => (
              <div key={team.id} className="p-3 bg-blue-500 rounded-lg hover:bg-blue-400 cursor-pointer transition-colors shadow-sm">
                <div className="flex justify-between items-center">
                  <span>{team.name}</span>
                  <button 
                    onClick={() => handleInviteMember(team.id)}
                    className="bg-blue-700 hover:bg-blue-600 text-white text-sm py-1 px-2 rounded transition-colors"
                  >
                    Invite
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invitations Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Invitations</h3>
          <div className="space-y-2">
            {invitations.map((invite) => (
              <div key={invite.id} className="p-3 bg-blue-500 rounded-lg shadow-sm">
                <span>{invite.team}</span>
                <button 
                  onClick={() => handleAcceptInvite(invite.id)}
                  className="ml-2 bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-2 rounded transition-colors"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
        {/* WebSocket Status */}
        <div className={`fixed top-4 right-4 p-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'} text-white text-sm flex items-center gap-2 transition-colors`}>
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-200' : 'bg-red-200'} animate-pulse`}></span>
          {wsConnected ? 'Connected' : 'Disconnected'}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setEditingNote(null);
              setTitle('');
              setContent('');
              setCategory('');
              setNoteModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md"
          >
            <FiPlus />
            <span>Add New Note</span>
          </button>

          <button
            onClick={() => setCategoryModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md"
          >
            <FiPlus />
            <span>Add Category</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="mb-4 md:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl md:text-2xl font-bold">{note.title}</h4>
                  {note.category && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {categories.find(cat => cat.id === note.category)?.name}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm md:text-base">{note.content}</p>
              </div>
              <div className="flex justify-end space-x-3 md:space-x-4">
                <button 
                  onClick={() => handleEditNote(note)} 
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button 
                  onClick={() => handleShareClick(note)} 
                  className="text-green-500 hover:text-green-600 transition-colors"
                  title="Share"
                >
                  <FiShare2 />
                </button>
                <button 
                  onClick={() => handleDeleteClick(note)} 
                  className="text-red-500 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {noteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">{editingNote ? 'Edit Note' : 'Add Note'}</h3>
            <form onSubmit={handleAddOrUpdateNote}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setNoteModalOpen(false)} 
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{noteToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteNote}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h3 className="text-xl md:text-2xl font-semibold mb-4">Add New Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setCategoryModalOpen(false)} 
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {teamModalOpen && (
        <CreateTeamModal onClose={() => setTeamModalOpen(false)} onTeamCreated={fetchTeams} />
      )}

      {inviteModalOpen && (
        <InviteModal onClose={() => setInviteModalOpen(false)} teamId={selectedTeamId} />
      )}

      {shareModalOpen && selectedNote && (
        <ShareModal note={selectedNote} onClose={() => setShareModalOpen(false)} onShare={handleShare} />
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
