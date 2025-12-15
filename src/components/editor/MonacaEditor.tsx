// components/editor/MonacoEditor.tsx
'use client'
import React, { useRef, useEffect } from 'react';

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: string;
}

export const MonacoEditor = ({ value, onChange}: MonacoEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      // Create a simple textarea-based editor as Monaco requires complex setup
      // In a real app, you'd use @monaco-editor/react
      const textarea = document.createElement('textarea');
      textarea.value = value || '';
      textarea.className = `
        w-full h-full bg-gray-900 text-white font-mono text-sm p-4 resize-none outline-none
        border-none focus:ring-0
      `.replace(/\s+/g, ' ').trim();
      textarea.style.fontFamily = 'Monaco, Menlo, "Ubuntu Mono", monospace';
      textarea.style.lineHeight = '1.5';
      textarea.style.tabSize = '2';
      
      textarea.addEventListener('input', (e) => {
        const target = e.target as HTMLTextAreaElement;
        onChange?.(target.value);
      });
      
      // Handle tab key
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          onChange?.(textarea.value);
        }
      });
      
      containerRef.current.appendChild(textarea);
      editorRef.current = textarea;
    }
    
    if (editorRef.current && editorRef.current.value !== value) {
      editorRef.current.value = value || '';
    }
  }, [value, onChange]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MonacoEditor;