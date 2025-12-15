'use client'
import React from 'react';
import MonacoEditor from './MonacaEditor';
import { FileItem } from '@/types/editor';

interface CodeEditorProps {
  file: FileItem | null;
  onContentChange: (content: string) => void;
}

const CodeEditor = ({ file, onContentChange }: CodeEditorProps) => {
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'sol':
        return 'solidity';
      case 'rs':
        return 'rust';
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      default:
        return 'plaintext';
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">🔗</div>
          <p className="text-lg">Select a contract to start editing</p>
          <p className="text-sm mt-2">Supports Solidity (.sol), Rust (.rs), and more</p>
        </div>
      </div>
    );
  }

  const language = getLanguage(file.name);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* File Tab */}
      <div className="flex items-center bg-gray-800 border-b border-gray-700 px-4 py-2">
        <span className="text-white text-sm flex items-center">
          {language === 'solidity' && <span className="mr-2">⚡</span>}
          {language === 'rust' && <span className="mr-2">🦀</span>}
          {language === 'javascript' && <span className="mr-2">📜</span>}
          {language === 'typescript' && <span className="mr-2">🔷</span>}
          {file.name}
        </span>
        <div className="ml-auto text-xs text-gray-400">
          <span className="capitalize">{language}</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <MonacoEditor
          value={file.content}
          onChange={onContentChange}
          language={language}
          theme="vs-dark"
        />
      </div>
    </div>
  );
};

export default CodeEditor;