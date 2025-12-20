'use client'
import React, { useCallback, useEffect } from 'react';
import FileNavigator from '@/components/editor/FileNavigator';
import CodeEditor from '@/components/editor/CodeEditor';
import EditorSidebar from '@/components/editor/EditorSidebar';
import { useFileStore } from '@/stores/fileStore';
import { useContractStore } from '@/stores/contractStore';
import { useContractOperations } from '@/hooks/useContractOperations';
import type { FileItem } from '@/types/editor';

export default function EditorPage() {
  const {
    files,
    selectedFile,
    setSelectedFile,
    createFile,
    deleteFile,
    updateFile,
    addFile
  } = useFileStore();

  const { contracts } = useContractStore();

  const {
    compilationResult,
    isCompiling,
    deployedAddress,
    handleCompile,
    handleDeploy
  } = useContractOperations();

  // Convert contracts to files when component mounts or contracts change
  useEffect(() => {
    contracts.forEach(contract => {
      // Check if contract is already in files to avoid duplicates
      const existingFile = files.find(file => file.name === contract.name);
      
      if (!existingFile && contract.content) {
        const fileItem: FileItem = {
          id: contract.address || `contract_${Date.now()}`,
          name: contract.name,
          content: contract.content,
          language: contract.language || 'solidity',
          type: 'file',
          size: contract.content.length // Calculate size from content length
        };
        
        addFile(fileItem);
        
        // Auto-select the newly created file
        if (!selectedFile) {
          setSelectedFile(fileItem);
        }
      }
    });
  }, [contracts, files, addFile, selectedFile, setSelectedFile]);

  const handleContentChange = useCallback((content: string): void => {
    if (!selectedFile) return;
    const updatedFile: FileItem = { 
      ...selectedFile, 
      content,
      size: content.length // Update size when content changes
    };
    updateFile(updatedFile);
  }, [selectedFile, updateFile]);

  // Handle file selection with proper typing
  const handleFileSelect = useCallback((file: FileItem | null) => {
    setSelectedFile(file);
  }, [setSelectedFile]);

  return (
    <div className="flex h-screen bg-gray-900">
      <FileNavigator
        files={files}
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileCreate={createFile}
        onFileDelete={deleteFile}
      />
      
      <div className="flex-1 flex">
        <CodeEditor
          file={selectedFile}
          onContentChange={handleContentChange}
        />
        
        <EditorSidebar
          selectedFile={selectedFile}
          onCompile={() => handleCompile(selectedFile)}
          onDeploy={handleDeploy}
          compilationResult={compilationResult || undefined}
          isCompiling={isCompiling}
          deployedAddress={deployedAddress}
        />
      </div>
    </div>
  );
}