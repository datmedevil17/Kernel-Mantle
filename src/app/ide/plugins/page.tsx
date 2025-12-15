// app/ide/plugins/page.tsx
'use client'
import React, { useState } from 'react'
import FileNavigator from '@/components/editor/FileNavigator'
import PluginManager from '@/components/plugins/PluginManager'
import { useFileStore } from '@/stores/fileStore'

export default function PluginsPage() {
  const {
    files,
    selectedFile,
    setSelectedFile,
    createFile,
    deleteFile,
    updateFile,
    addFile
  } = useFileStore()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingType, setGeneratingType] = useState<string>('')

  return (
    <div className="flex h-full">
      <FileNavigator
        files={files}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        onFileCreate={createFile}
        onFileDelete={deleteFile}
      />
      <div className="flex-1 bg-white">
        {selectedFile ? (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">{selectedFile.name}</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto h-96">
              {selectedFile.content}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a file to view its content
          </div>
        )}
      </div>
      <PluginManager
        selectedFile={selectedFile}
        files={files}
        onFileUpdate={updateFile}
        onAddFile={addFile}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        generatingType={generatingType}
        setGeneratingType={setGeneratingType}
      />
    </div>
  )
}