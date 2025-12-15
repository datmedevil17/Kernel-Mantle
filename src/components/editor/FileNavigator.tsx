// components/editor/FileNavigator.tsx
'use client'
import React, { useState } from 'react';
import { FileItem } from '../../types/editor';

interface FileNavigatorProps {
  files: FileItem[];
  selectedFile: FileItem | null;
  onFileSelect: (file: FileItem) => void;
  onFileCreate: (name: string) => void;
  onFileDelete: (id: string) => void;
}

const FileNavigator = ({
  files,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
}: FileNavigatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleCreateFile();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewFileName('');
    }
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'sol':
        return '⚡';
      case 'rs':
        return '🦀';
      case 'js':
        return '📜';
      case 'ts':
        return '🔷';
      case 'json':
        return '📋';
      case 'css':
        return '🎨';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Files</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {/* New File Input */}
        {isCreating && (
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (!newFileName.trim()) {
                  setIsCreating(false);
                }
              }}
              placeholder="filename.sol"
              className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}

        {/* File Items */}
        <div className="p-2 space-y-1">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors group ${
                selectedFile?.id === file.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => onFileSelect(file)}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-sm">{getFileIcon(file.name)}</span>
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                title="Delete File"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {files.length === 0 && !isCreating && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No files yet</p>
            <p className="text-xs mt-1">Click + to create a new file</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileNavigator;