// src/components/NoteDisplay.js
import React, { useState, useEffect } from 'react';
import ShareModal from './ShareModal';

const NoteDisplay = ({ notes, onEdit, onDelete, onShare }) => {
  const [noteContents, setNoteContents] = useState(notes); // Store the initial notes
  const [selectedNote, setSelectedNote] = useState(null); // Track the note selected for sharing
  console.log('testing')
  useEffect(() => {
    // Open a single WebSocket connection
    const ws = new WebSocket('ws://localhost:8001/ws/notes/');
    console.log({ws})
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { id, title, content } = data;

      // Update the specific note's content based on the received ID
      setNoteContents((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, title, content } : note
        )
      );
    };

    // Clean up WebSocket connection when component unmounts
    return () => ws.close();
  }, []);

  const handleShareClick = (note) => {
    setSelectedNote(note);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {noteContents.map((note) => (
        <div key={note.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-semibold mb-2">{note.title}</h4>
            <p className="text-gray-700">{note.content}</p>
          </div>
          <div className="flex justify-between space-x-2 mt-4">
            <button onClick={() => onEdit(note)} className="text-blue-500 hover:underline">Edit</button>
            <button onClick={() => onDelete(note.id)} className="text-red-500 hover:underline">Delete</button>
            <button onClick={() => handleShareClick(note)} className="text-green-500 hover:underline">Share</button>
          </div>
        </div>
      ))}
      {selectedNote && (
        <ShareModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onShare={onShare}
        />
      )}
    </div>
  );
};

export default NoteDisplay;
