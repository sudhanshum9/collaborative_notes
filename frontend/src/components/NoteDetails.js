// src/components/NoteDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const NoteDetail = () => {
  const { noteId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/notes/${noteId}/`);
    setSocket(ws);

    // Handle incoming messages
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTitle(data.title);
      setContent(data.content);
    };

    // Clean up on component unmount
    return () => ws.close();
  }, [noteId]);

  // Send updated content when typing
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ title, content: newContent }));
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ title: newTitle, content }));
    }
  };

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="w-full px-4 py-2 mb-4 border rounded-lg"
        placeholder="Note Title"
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        className="w-full px-4 py-2 mb-4 border rounded-lg"
        rows="10"
        placeholder="Note Content"
      ></textarea>
    </div>
  );
};

export default NoteDetail;
