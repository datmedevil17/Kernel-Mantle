'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Play, Users, Clock, Share2, Save, Download } from 'lucide-react';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
}

interface TimelineEvent {
  id: string;
  type: 'edit' | 'join' | 'leave' | 'create';
  userId: string;
  userName: string;
  timestamp: Date;
  description: string;
  content?: string;
}

interface CollaborativeEditorProps {
  initialCode?: string;
  language?: string;
  roomId?: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  initialCode = '',
  language = 'javascript',
  roomId: propRoomId
}) => {
  const [code, setCode] = useState(initialCode);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [roomId, setRoomId] = useState(propRoomId || '');
  const [users, setUsers] = useState<User[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('/api/socket', {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('code-change', (data: { code: string; userId: string }) => {
      if (data.userId !== newSocket.id) {
        setCode(data.code);
      }
    });

    newSocket.on('user-joined', (data: { users: User[]; user: User }) => {
      setUsers(data.users);
      addTimelineEvent({
        type: 'join',
        userId: data.user.id,
        userName: data.user.name,
        description: `${data.user.name} joined the collaboration`
      });
    });

    newSocket.on('user-left', (data: { users: User[]; userId: string; userName: string }) => {
      setUsers(data.users);
      addTimelineEvent({
        type: 'leave',
        userId: data.userId,
        userName: data.userName,
        description: `${data.userName} left the collaboration`
      });
    });

    newSocket.on('cursor-position', (data: { userId: string; position: { line: number; column: number } }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, cursor: data.position }
          : user
      ));
    });

    newSocket.on('timeline-event', (event: TimelineEvent) => {
      setTimeline(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addTimelineEvent = (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setTimeline(prev => [newEvent, ...prev].slice(0, 50));
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);

    if (socket && isCollaborating) {
      // Debounce the socket emission
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        socket.emit('code-change', { code: newCode, roomId });
        addTimelineEvent({
          type: 'edit',
          userId: socket.id || '',
          userName: userName || 'Anonymous',
          description: 'Made changes to the code',
          content: newCode.slice(0, 100) + (newCode.length > 100 ? '...' : '')
        });
      }, 300);
    }
  };

  const handleCursorChange = () => {
    if (editorRef.current && socket && isCollaborating) {
      const textarea = editorRef.current;
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;
      
      // Calculate line and column
      const lines = text.slice(0, cursorPos).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length;
      
      const newPosition = { line, column };
      setCursorPosition(newPosition);
      
      socket.emit('cursor-position', { roomId, position: newPosition });
    }
  };

  const startCollaboration = () => {
    if (!socket || !userName.trim()) {
      alert('Please enter your name first');
      return;
    }

    const newRoomId = roomId || generateRoomId();
    setRoomId(newRoomId);
    
    socket.emit('join-room', { 
      roomId: newRoomId, 
      userName: userName.trim(),
      code: code 
    });
    
    setIsCollaborating(true);
    
    addTimelineEvent({
      type: 'create',
      userId: socket.id || '',
      userName: userName.trim(),
      description: `Started collaboration session: ${newRoomId}`
    });
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert('Room ID copied to clipboard!');
  };

  const saveCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-${Date.now()}.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runCode = () => {
    // Basic code execution for demonstration
    if (language === 'javascript') {
      try {
        const result = eval(code);
        console.log('Code output:', result);
        alert('Check console for output');
      } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error);
      }
    } else {
      alert('Code execution is only supported for JavaScript in this demo');
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const userColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Collaborative Code Editor</h1>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{users.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/5 p-4 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            {!isCollaborating ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Room ID (optional)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={startCollaboration}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Start Collaboration
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-white/80">Room: {roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Copy Room ID
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={runCode}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                onClick={saveCode}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              >
                <Clock className="w-4 h-4" />
                Timeline
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-96">
          {/* Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              onSelect={handleCursorChange}
              onKeyUp={handleCursorChange}
              onClick={handleCursorChange}
              placeholder="Start typing your code here..."
              className="w-full h-full p-4 bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none"
              style={{ tabSize: 2 }}
            />
            
            {/* Active Users */}
            {isCollaborating && users.length > 0 && (
              <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3">
                <div className="text-white text-sm mb-2">Active Users:</div>
                {users.map((user, index) => (
                  <div key={user.id} className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: userColors[index % userColors.length] }}
                    ></div>
                    <span className="text-white text-xs">{user.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          {showTimeline && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </h3>
              <div className="space-y-3">
                {timeline.map((event) => (
                  <div key={event.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-300">{formatTimestamp(event.timestamp)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.type === 'edit' ? 'bg-blue-500/20 text-blue-300' :
                        event.type === 'join' ? 'bg-green-500/20 text-green-300' :
                        event.type === 'leave' ? 'bg-red-500/20 text-red-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-white text-sm">{event.description}</p>
                    {event.content && (
                      <div className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300 font-mono">
                        {event.content}
                      </div>
                    )}
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="text-gray-400 text-sm">No events yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;