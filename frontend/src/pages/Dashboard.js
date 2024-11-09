// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InviteModal from '../components/InviteModal';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);  // User profile data
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingNote, setEditingNote] = useState(null);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teams, setTeams] = useState([]);
    const [socket, setSocket] = useState(null);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/profile/', {
                headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
            });
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user profile", error);
        }
    };

    const fetchNotes = async () => {
        const response = await axios.get('http://localhost:8000/api/notes/', {
            headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        setNotes(response.data);
    };

    const fetchTeams = async () => {
        const response = await axios.get('http://localhost:8000/api/teams/', {
            headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        setTeams(response.data);
    };

    useEffect(() => {
        fetchUserProfile();
        fetchNotes();
        fetchTeams();

        // Set up WebSocket for real-time note updates
        const ws = new WebSocket('ws://localhost:8000/ws/notes/');
        setSocket(ws);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setNotes((prevNotes) => prevNotes.map(note => note.id === data.id ? data : note));
        };

        return () => ws.close();
    }, []);

    const handleAddOrUpdateNote = async (e) => {
        e.preventDefault();
        const noteData = { title, content };
        try {
            if (editingNote) {
                const response = await axios.put(`http://localhost:8000/api/notes/${editingNote.id}/`, noteData, {
                    headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
                });
                setNotes(notes.map((note) => (note.id === editingNote.id ? response.data : note)));
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(response.data)); // Send updated note to WebSocket
                }
                setEditingNote(null);
            } else {
                const response = await axios.post('http://localhost:8000/api/notes/', noteData, {
                    headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
                });
                setNotes([...notes, response.data]);
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(response.data)); // Send new note to WebSocket
                }
            }
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error saving note', error);
        }
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setTitle(note.title);
        setContent(note.content);
    };

    const handleDeleteNote = async (id) => {
        await axios.delete(`http://localhost:8000/api/notes/${id}/`, {
            headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
        });
        setNotes(notes.filter((note) => note.id !== id));
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/teams/', { name: teamName }, {
                headers: { Authorization: `Token ${localStorage.getItem('auth_token')}` },
            });
            alert(`Team ${response.data.name} created successfully!`);
            setTeamName('');
            setTeamModalOpen(false);
            fetchTeams();
        } catch (error) {
            console.error('Error creating team', error);
            alert('Failed to create team.');
        }
    };

    return (
        <div className="min-h-screen p-4 bg-gray-100">
            {/* Display User Information */}
            {user && (
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Welcome, {user.username}!</h2>
                    <p className="text-gray-600">{user.email}</p>
                </div>
            )}
            <div className="text-center mb-4">
                <Link to="/invitations" className="text-blue-500 hover:underline">
                    View Pending Invitations
                </Link>
            </div>
            <h2 className="text-3xl font-bold text-center mb-4">Dashboard</h2>

            {/* Team Management Buttons */}
            <div className="flex flex-wrap justify-center mb-6 space-x-4">
                <button onClick={() => setInviteModalOpen(true)} className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition">
                    Invite Team Member
                </button>
                <button onClick={() => setTeamModalOpen(true)} className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    Create New Team
                </button>
            </div>

            {/* Invite Modal */}
            {inviteModalOpen && <InviteModal teamId={1} onClose={() => setInviteModalOpen(false)} />}

            {/* Create Team Modal */}
            {teamModalOpen && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
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
                            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mb-2">Create Team</button>
                            <button onClick={() => setTeamModalOpen(false)} className="w-full bg-gray-300 py-2 rounded">Close</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Notes Form */}
            <form onSubmit={handleAddOrUpdateNote} className="bg-white p-4 rounded-lg shadow-md mb-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold mb-2">{editingNote ? 'Edit Note' : 'Add New Note'}</h3>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 mb-2 border rounded-lg"
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2 mb-2 border rounded-lg"
                    rows="3"
                ></textarea>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                    {editingNote ? 'Update Note' : 'Add Note'}
                </button>
            </form>

            {/* Notes Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {notes.map((note) => (
                    <div key={note.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
                        <div>
                            <h4 className="text-lg font-semibold mb-2">{note.title}</h4>
                            <p className="text-gray-700">{note.content}</p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={() => handleEditNote(note)} className="text-blue-500 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Teams Display */}
            <h3 className="text-xl font-bold mt-8 mb-4 text-center">Your Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {teams.map((team) => (
                    <div key={team.id} className="bg-white p-4 rounded-lg shadow-md">
                        <h4 className="text-lg font-semibold">{team.name}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard