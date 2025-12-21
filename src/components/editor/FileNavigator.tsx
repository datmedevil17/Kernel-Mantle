"use client"
import type React from "react"
import { useState } from "react"
import type { FileItem } from "../../types/editor"

interface FileNavigatorProps {
  files: FileItem[]
  selectedFile: FileItem | null
  onFileSelect: (file: FileItem) => void
  onFileCreate: (name: string) => void
  onFileDelete: (id: string) => void
}

const FileNavigator = ({ files, selectedFile, onFileSelect, onFileCreate, onFileDelete }: FileNavigatorProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newFileName, setNewFileName] = useState("")

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName.trim())
      setNewFileName("")
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleCreateFile()
    } else if (e.key === "Escape") {
      setIsCreating(false)
      setNewFileName("")
    }
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "sol":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        )
      case "rs":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.8 12.7c-.2-.4-.6-.7-1-.7h-1.9c.1-.3.1-.7.1-1s0-.7-.1-1h1.9c.4 0 .8-.3 1-.7.2-.4.1-.9-.2-1.2l-1.3-1.3c-.2-.2-.4-.3-.7-.3s-.5.1-.7.3l-1.4 1.4c-.5-.4-1.1-.7-1.7-.9V5.4c0-.4-.3-.8-.7-1s-.9-.1-1.2.2L14.3 5.9c-.2.2-.3.4-.3.7s.1.5.3.7l1.4 1.4c-.2.6-.5 1.2-.9 1.7l-1.4-1.4c-.2-.2-.4-.3-.7-.3s-.5.1-.7.3c-.4.4-.4 1 0 1.4l1.4 1.4c-.4.5-.7 1.1-.9 1.7l-1.4-1.4c-.2-.2-.4-.3-.7-.3s-.5.1-.7.3l-1.3 1.3c-.3.3-.4.8-.2 1.2.2.4.6.7 1 .7h1.9c-.1.3-.1.7-.1 1s0 .7.1 1H5.2c-.4 0-.8.3-1 .7-.2.4-.1.9.2 1.2l1.3 1.3c.2.2.4.3.7.3s.5-.1.7-.3l1.4-1.4c.5.4 1.1.7 1.7.9v1.9c0 .4.3.8.7 1s.9.1 1.2-.2l1.3-1.3c.2-.2.3-.4.3-.7s-.1-.5-.3-.7l-1.4-1.4c.2-.6.5-1.2.9-1.7l1.4 1.4c.2.2.4.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-1.4-1.4c.4-.5.7-1.1.9-1.7l1.4 1.4c.2.2.4.3.7.3s.5-.1.7-.3l1.3-1.3c.3-.3.4-.8.2-1.2z" />
          </svg>
        )
      case "js":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.114-.484.637-.6 1.057-.479.27.08.52.286.676.627.537-.35.537-.35.9-.594-.137-.214-.209-.307-.3-.398-.329-.423-.776-.641-1.548-.641l-.365.037c-.914.199-1.746.711-1.955 1.684-.298 1.388.096 2.233 1.301 2.878.474.248 1.25.662 1.174 1.176-.123.662-.615.918-1.261.728-.523-.255-.81-.732-.92-1.378l-.906.598c.176.976.69 1.473 1.434 1.816.906.256 2.029.2 2.722-.64.559-.706.621-1.849.328-2.471z" />
          </svg>
        )
      case "ts":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
          </svg>
        )
      case "json":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.843 8.195L9.56 8.195Q10.188 8.195 10.188 7.567L10.188 7.567Q10.188 6.939 9.56 6.939L9.56 6.939L5.843 6.939Q4.587 6.939 3.959 7.567Q3.331 8.195 3.331 9.451L3.331 9.451L3.331 10.079Q3.331 10.707 2.703 10.707L2.703 10.707Q2.075 10.707 2.075 10.079L2.075 10.079L2.075 9.451Q2.075 7.567 3.331 6.311Q4.587 5.055 6.471 5.055L6.471 5.055L9.56 5.055Q11.444 5.055 11.444 6.939L11.444 6.939Q11.444 8.823 9.56 8.823L9.56 8.823L5.843 8.823Q5.215 8.823 5.215 9.451L5.215 9.451L5.215 10.079Q5.215 10.707 5.843 10.707L5.843 10.707L9.56 10.707Q10.188 10.707 10.188 11.335L10.188 11.335Q10.188 11.963 9.56 11.963L9.56 11.963L5.843 11.963Q4.587 11.963 3.959 12.591Q3.331 13.219 3.331 14.475L3.331 14.475L3.331 15.103Q3.331 15.731 2.703 15.731L2.703 15.731Q2.075 15.731 2.075 15.103L2.075 15.103L2.075 14.475Q2.075 12.591 3.331 11.335Q4.587 10.079 6.471 10.079L6.471 10.079L9.56 10.079Q11.444 10.079 11.444 11.963L11.444 11.963Q11.444 13.847 9.56 13.847L9.56 13.847L5.843 13.847Q5.215 13.847 5.215 14.475L5.215 14.475L5.215 15.103Q5.215 15.731 5.843 15.731L5.843 15.731L9.56 15.731Q10.188 15.731 10.188 16.359L10.188 16.359Q10.188 16.987 9.56 16.987L9.56 16.987L6.471 16.987Q4.587 16.987 3.331 15.731Q2.075 14.475 2.075 12.591L2.075 12.591L2.075 11.963Q2.075 11.335 2.703 11.335L2.703 11.335Q3.331 11.335 3.331 11.963L3.331 11.963L3.331 12.591Q3.331 13.219 3.959 13.847Q4.587 14.475 5.843 14.475L5.843 14.475L9.56 14.475Q10.188 14.475 10.188 13.847L10.188 13.847Q10.188 13.219 9.56 13.219L9.56 13.219L5.843 13.219Q4.587 13.219 3.959 12.591Q3.331 11.963 3.331 10.707L3.331 10.707L3.331 10.079Q3.331 8.823 3.959 8.195Q4.587 7.567 5.843 7.567L5.843 7.567L9.56 7.567Q10.188 7.567 10.188 8.195L10.188 8.195Q10.188 8.823 9.56 8.823L9.56 8.823L5.843 8.823Q5.215 8.823 5.215 8.195L5.215 8.195L5.215 7.567Q5.215 6.939 5.843 6.939L5.843 6.939L9.56 6.939Q10.188 6.939 10.188 7.567L10.188 7.567Q10.188 8.195 9.56 8.195L9.56 8.195L5.843 8.195Z" />
          </svg>
        )
      case "css":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.413l.213 2.622h10.125l-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z" />
          </svg>
        )
      case "html":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )
    }
  }

  const getFileColor = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "sol":
        return "text-purple-400"
      case "rs":
        return "text-orange-400"
      case "js":
        return "text-yellow-400"
      case "ts":
        return "text-blue-400"
      case "json":
        return "text-green-400"
      case "css":
        return "text-pink-400"
      case "html":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="w-64 bg-black border-r border-gray-800/50 flex flex-col h-full pt-25">
      {/* Header */}
      <div className="relative p-4 border-b border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <h2 className="text-white font-medium text-sm flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0H8v0z"
              />
            </svg>
            EXPLORER
          </h2>
          <button
            onClick={() => setIsCreating(true)}
            className="group p-1.5 hover:bg-gray-800/60 rounded-md text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
            title="New File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
        {/* New File Input */}
        {isCreating && (
          <div className="p-3 border-b border-gray-800/30 bg-gray-900/20">
            <div className="relative">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  if (!newFileName.trim()) {
                    setIsCreating(false)
                  }
                }}
                placeholder="filename.sol"
                className="w-full px-3 py-2 bg-gray-900/80 text-white text-sm rounded-lg outline-none 
                          focus:ring-1 focus:ring-purple-500/50 focus:bg-gray-900 border border-gray-700/50 
                          placeholder-gray-500 transition-all duration-200 backdrop-blur-sm"
                autoFocus
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          </div>
        )}

        {/* File Items */}
        <div className="p-2 space-y-0.5">
          {files.map((file) => (
            <div
              key={file.id}
              className={`group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedFile?.id === file.id
                  ? "bg-gray-800/80 text-white shadow-lg border border-gray-700/50"
                  : "text-gray-300 hover:bg-gray-900/60 hover:text-white border border-transparent"
              }`}
              onClick={() => onFileSelect(file)}
            >
              {/* Selection indicator */}
              {selectedFile?.id === file.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-purple-500 rounded-full"></div>
              )}

              <div className="flex items-center space-x-3 flex-1 min-w-0 ml-1">
                <div className={`${getFileColor(file.name)} transition-colors`}>{getFileIcon(file.name)}</div>
                <span className="text-sm font-medium truncate">{file.name}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFileDelete(file.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-200 hover:bg-red-900/30 hover:text-red-400 text-gray-500"
                title="Delete File"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {files.length === 0 && !isCreating && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-900/50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0H8v0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-400 mb-1">No files yet</p>
            <p className="text-xs text-gray-600">Create your first file to get started</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="relative p-3 text-xs text-gray-500 border-t border-gray-800/50 bg-gray-950/80">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {files.length} {files.length === 1 ? "file" : "files"}
          </span>
          {selectedFile && (
            <span className="flex items-center text-gray-400 truncate max-w-32">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1.5 animate-pulse"></div>
              {selectedFile.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileNavigator
