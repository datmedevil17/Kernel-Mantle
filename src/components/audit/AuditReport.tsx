// components/audit/AuditReport.tsx
'use client'
import React from 'react';
import { FileItem } from '@/types/editor';
import { AuditResult, SecurityIssue, Suggestion, AnalyticsData } from '@/app/ide/audit/page';

interface AuditReportProps {
  file: FileItem | null;
  currentReport: AuditResult | null;
  isGenerating: boolean;
  generatingType: string;
}

const AuditReport: React.FC<AuditReportProps> = ({
  file,
  currentReport,
  isGenerating,
  generatingType
}) => {
  const renderSecurityIssues = (issues: SecurityIssue[]) => (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div key={issue.id} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{issue.title}</h3>
            <span className={`px-2 py-1 rounded text-sm ${getSeverityColor(issue.severity)}`}>
              {issue.severity}
            </span>
          </div>
          <p className="text-gray-300 mb-2">{issue.description}</p>
          {issue.lineNumber && (
            <p className="text-gray-400 text-sm mb-2">Line: {issue.lineNumber}</p>
          )}
          <div className="text-gray-300">
            <p className="font-semibold mb-1">Recommendation:</p>
            <p>{issue.recommendation}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSuggestions = (suggestions: Suggestion[]) => (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{suggestion.title}</h3>
            <div className="flex items-center space-x-3">
              <div className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded text-xs font-medium">
                {(suggestion.type || 'general').toString().replace('-', ' ').toUpperCase()}
              </div>
              <div className={`text-sm font-medium ${getImpactColor(suggestion.impact || 'low')}`}>
                {(suggestion.impact || 'low').toUpperCase()} IMPACT
              </div>
            </div>
          </div>
          <p className="text-gray-300 mb-2">{suggestion.description}</p>
          {suggestion.codeExample && (
            <pre className="bg-gray-900 p-3 rounded-lg text-sm text-gray-300 overflow-x-auto">
              {suggestion.codeExample}
            </pre>
          )}
        </div>
      ))}
    </div>
  );

  const renderAnalytics = (analytics: AnalyticsData) => {
    // Ensure default values for undefined properties
    const defaultMetrics = {
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        score: 'moderate' as const
      },
      codeQuality: {
        maintainability: 0,
        readability: 0,
        testability: 0,
        overall: 0
      },
      metrics: {
        linesOfCode: 0,
        functions: 0,
        variables: 0,
        comments: 0,
        commentRatio: 0
      }
    };

    const safeAnalytics = {
      ...defaultMetrics,
      ...analytics,
      codeQuality: {
        ...defaultMetrics.codeQuality,
        ...(analytics?.codeQuality || {})
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Complexity Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(safeAnalytics.complexity).map(([key, value], index) => (
              <div key={`complexity-${key}-${index}`} className="text-gray-300">
                <p className="text-sm text-gray-400">{key}</p>
                <p className="text-lg">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Code Quality</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(safeAnalytics.codeQuality).map(([key, value], index) => (
              <div key={`quality-${key}-${index}`} className="text-gray-300">
                <p className="text-sm text-gray-400">{key}</p>
                <p className="text-lg">{value}/100</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Code Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(safeAnalytics.metrics).map(([key, value], index) => (
              <div key={`metrics-${key}-${index}`} className="text-gray-300">
                <p className="text-sm text-gray-400">{key}</p>
                <p className="text-lg">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {analytics?.gasOptimization && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Gas Optimization</h3>
            <div className="space-y-2">
              <div className="text-gray-300">
                <p className="text-sm text-gray-400">Estimated Gas</p>
                <p className="text-lg">{analytics.gasOptimization.estimatedGas}</p>
              </div>
              <div className="text-gray-300">
                <p className="text-sm text-gray-400">Optimization Potential</p>
                <p className="text-lg">{analytics.gasOptimization.optimizationPotential}%</p>
              </div>
              <div className="text-gray-300">
                <p className="text-sm text-gray-400 mb-2">Suggestions</p>
                <ul className="list-disc pl-5 space-y-1">
                  {analytics.gasOptimization.suggestions.map((suggestion, index) => (
                    <li key={`gas-suggestion-${index}`}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-900 text-red-200',
      high: 'bg-orange-900 text-orange-200',
      medium: 'bg-yellow-900 text-yellow-200',
      low: 'bg-blue-900 text-blue-200',
      info: 'bg-gray-900 text-gray-200'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'bg-red-900 text-red-200',
      medium: 'bg-yellow-900 text-yellow-200',
      low: 'bg-blue-900 text-blue-200'
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  if (!file) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center text-gray-500">
        Select a file to view audit reports
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-400">Generating {generatingType}...</p>
        </div>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center text-gray-500">
        Generate a report using the sidebar options
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentReport.type.charAt(0).toUpperCase() + currentReport.type.slice(1)} Report
          </h2>
          <p className="text-gray-400">
            Generated on {currentReport.timestamp.toLocaleString()}
          </p>
        </div>

        {currentReport.type === 'audit' && renderSecurityIssues(currentReport.data.securityIssues)}
        {currentReport.type === 'suggestions' && renderSuggestions(currentReport.data.suggestions)}
        {currentReport.type === 'analytics' && renderAnalytics(currentReport.data.analytics)}
      </div>
    </div>
  );
};

export default AuditReport;