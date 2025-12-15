// types/editor.ts
export interface FileItem {
  id: string;
  name: string;
  content: string;
  type: 'file' | 'folder';
  extension?: string;
}