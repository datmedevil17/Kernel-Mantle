// stores/fileStore.ts
import { create } from 'zustand'

export interface FileItem {
  id: string
  name: string
  content: string
  language: string
  type: 'file' | 'folder'
  size?: number;
}

interface FileStore {
  files: FileItem[]
  selectedFile: FileItem | null
  setSelectedFile: (file: FileItem | null) => void
  createFile: (name: string) => void
  deleteFile: (id: string) => void
  updateFile: (file: FileItem) => void
  addFile: (file: FileItem) => void // Add this method
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  selectedFile: null,
  
  setSelectedFile: (file) => set({ selectedFile: file }),
  
  createFile: (name) => {
    const newFile: FileItem = {
      id: `file_${Date.now()}`,
      name,
      content: '',
      language: getLanguageFromExtension(name),
      type: 'file'
    }
    set((state) => ({
      files: [...state.files, newFile],
      selectedFile: newFile
    }))
  },
  
  deleteFile: (id) => set((state) => ({
    files: state.files.filter((file) => file.id !== id),
    selectedFile: state.selectedFile?.id === id ? null : state.selectedFile
  })),
  
  updateFile: (updatedFile) => set((state) => ({
    files: state.files.map((file) => 
      file.id === updatedFile.id ? updatedFile : file
    ),
    selectedFile: state.selectedFile?.id === updatedFile.id ? updatedFile : state.selectedFile
  })),
  
  // Add the addFile method
  addFile: (file) => {
    const { files } = get()
    // Check if file already exists to avoid duplicates
    const existingFile = files.find(f => f.id === file.id || f.name === file.name)
    if (!existingFile) {
      set((state) => ({
        files: [...state.files, file]
      }))
    }
  }
}))

// Helper function to determine language from file extension
function getLanguageFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'sol':
      return 'solidity'
    case 'rs':
      return 'rust'
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    case 'json':
      return 'json'
    case 'css':
      return 'css'
    case 'html':
      return 'html'
    default:
      return 'plaintext'
  }
}