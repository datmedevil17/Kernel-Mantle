import { create } from 'zustand'
import { FileItem } from '@/types/editor'

const defaultSolidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string private greeting;
    
    constructor() {
        greeting = "Hello, World!";
    }
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
    
    function getGreeting() public view returns (string memory) {
        return greeting;
    }
}`

interface FileStore {
  files: FileItem[]
  selectedFile: FileItem | null
  setFiles: (files: FileItem[]) => void
  setSelectedFile: (file: FileItem | null) => void
  addFile: (file: FileItem) => void
  updateFile: (updatedFile: FileItem) => void
  deleteFile: (id: string) => void
  createFile: (name: string) => void
}

export const useFileStore = create<FileStore>((set) => ({
  files: [{
    id: '1',
    name: 'HelloWorld.sol',
    content: defaultSolidityCode,
    type: 'file',
    extension: 'sol',
  }],
  selectedFile: null,
  setFiles: (files) => set({ files }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFile: (updatedFile) => set((state) => ({
    files: state.files.map(file => file.id === updatedFile.id ? updatedFile : file)
  })),
  deleteFile: (id) => set((state) => ({
    files: state.files.filter(file => file.id !== id),
    selectedFile: state.selectedFile?.id === id ? null : state.selectedFile
  })),
  createFile: (name) => {
    const extension = name.split('.').pop()?.toLowerCase()
    let defaultContent = ''
    
    switch (extension) {
      case 'sol':
        defaultContent = '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\n'
        break
      case 'js':
        defaultContent = '// JavaScript file\n\n'
        break
      case 'ts':
        defaultContent = '// TypeScript file\n\n'
        break
      case 'json':
        defaultContent = '{\n  \n}'
        break
      default:
        defaultContent = ''
    }
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name,
      content: defaultContent,
      type: 'file',
      extension: extension || '',
    }
    
    set((state) => ({
      files: [...state.files, newFile],
      selectedFile: newFile
    }))
  }
}))