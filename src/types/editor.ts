// types/editor.ts
export interface FileItem {
  size: number;
  id: string;
  name: string;
  content: string;
  type: 'file' | 'folder';
  extension?: string;
}