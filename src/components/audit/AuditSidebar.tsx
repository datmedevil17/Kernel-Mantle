// components/audit/AuditSidebar.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { FileItem } from '@/types/editor';
import { AuditResult } from '@/app/ide/audit/page';

interface AuditSidebarProps {
  selectedFile: FileItem | null;
  onGenerateAudit: () => void;
  onGenerateSuggestions: () => void;
  onGenerateAnalytics: () => void;
  auditResults: AuditResult[];
  currentReport: AuditResult | null;
  onReportSelect: (report: AuditResult) => void;
  isGenerating: boolean;
  generatingType: string;
}

const AuditSidebar = ({
  selectedFile,
  onGenerateAudit,
  onGenerateSuggestions,
  onGenerateAnalytics,
  auditResults,
  currentReport,
  onReportSelect,
  isGenerating,
  generatingType,
}: AuditSidebarProps) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString());
  }, []);

  if (!selectedFile) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select a file to start audit</p>
        </div>
      </div>
    );
  }

  const getFileLanguage = (filename: string): string => {
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
      default:
        return 'unknown';
    }
  };

  const language = getFileLanguage(selectedFile.name);
  const fileResults = auditResults.filter(result => result.fileId === selectedFile.id);

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'audit':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.054-.382-3.016z" />
          </svg>
        );
      case 'suggestions':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'analytics':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-white font-semibold text-sm mb-2">AI Audit Tools</h2>
        <div className="text-xs text-gray-400 mb-4">
          Language: <span className="text-white capitalize">{language}</span>
        </div>
      </div>

      {/* AI Actions */}
      <div className="space-y-3 mb-8">
        <h3 className="text-white font-semibold text-sm mb-3">Generate Reports</h3>
        
        <button
          onClick={onGenerateAudit}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isGenerating && generatingType === 'audit' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.054-.382-3.016z" />
              </svg>
              <span>Generate Audit Report</span>
            </>
          )}
        </button>
        
        <button
          onClick={onGenerateSuggestions}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isGenerating && generatingType === 'suggestions' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Generate Suggestions</span>
            </>
          )}
        </button>
        
        <button
          onClick={onGenerateAnalytics}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {isGenerating && generatingType === 'analytics' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Generate Analytics</span>
            </>
          )}
        </button>
      </div>

      {/* Report History */}
      <div className="mb-6">
        <h3 className="text-white font-semibold text-sm mb-3">Report History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {fileResults.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">
              No reports generated yet
            </div>
          ) : (
            fileResults.map((result, index) => (
              <button
                key={index}
                onClick={() => onReportSelect(result)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  currentReport === result
                    ? 'bg-gray-700 border border-gray-600'
                    : 'bg-gray-900 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {getReportIcon(result.type)}
                  <span className="text-xs font-medium text-white capitalize">
                    {result.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(result.timestamp)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {result.type === 'audit' && (
                    `${result.data.securityIssues?.length || 0} issues found`
                  )}
                  {result.type === 'suggestions' && (
                    `${result.data.suggestions?.length || 0} suggestions`
                  )}
                  {result.type === 'analytics' && (
                    `Quality Score: ${result.data.analytics?.codeQuality?.overall || 0}%`
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {currentReport && (
        <div className="mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Quick Stats</h3>
          <div className="bg-gray-900 rounded-lg p-3 space-y-2">
            {currentReport.type === 'audit' && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Issues:</span>
                  <span className="text-white">
                    {currentReport.data.securityIssues?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Critical:</span>
                  <span className="text-red-400">
                    {currentReport.data.securityIssues?.filter((i: any) => i.severity === 'critical').length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">High:</span>
                  <span className="text-orange-400">
                    {currentReport.data.securityIssues?.filter((i: any) => i.severity === 'high').length || 0}
                  </span>
                </div>
              </>
            )}
            {currentReport.type === 'suggestions' && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Suggestions:</span>
                <span className="text-white">
                  {currentReport.data.suggestions?.length || 0}
                </span>
              </div>
            )}
            {currentReport.type === 'analytics' && (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Overall Quality:</span>
                  <span className="text-green-400">
                    {currentReport.data.analytics?.codeQuality?.overall || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Complexity:</span>
                  <span className="text-yellow-400 capitalize">
                    {currentReport.data.analytics?.complexity?.score || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Lines of Code:</span>
                  <span className="text-white">
                    {currentReport.data.analytics?.metrics?.linesOfCode || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Model Info */}
      <div className="mb-6">
        <h4 className="text-gray-400 text-xs font-medium mb-2">AI MODEL INFO</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Model: GPT-4 Turbo</div>
          <div>Mode: Security Audit</div>
          <div>Language: {language}</div>
          <div>Last Updated: {formattedDate || new Date().toISOString().split('T')[0]}</div>
        </div>
      </div>

      {/* Output Section */}
      <div className="mt-8">
        <h4 className="text-gray-400 text-xs font-medium mb-2">STATUS</h4>
        <div className="bg-gray-900 rounded p-3 text-xs text-gray-400 font-mono min-h-[60px] max-h-32 overflow-y-auto">
          {isGenerating ? (
            <div className="text-yellow-400 flex items-center space-x-2">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8.004 8.004 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
              </svg>
              <span>Generating {generatingType}...</span>
            </div>
          ) : currentReport ? (
            <div className="text-green-400">
              ✓ {currentReport.type} report generated successfully
            </div>
          ) : (
            'Ready to generate AI reports...'
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditSidebar;