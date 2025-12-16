import React from 'react';
import { AlertTriangle, Code, Info, Shield, Zap } from 'lucide-react';
import { SecurityIssue, GasEstimates } from '@/types';

interface GeneratedCodePanelProps {
  generatedCode: string;
  securityIssues: SecurityIssue[];
  gasEstimates: GasEstimates;
  onClose: () => void;
}

const GeneratedCodePanel: React.FC<GeneratedCodePanelProps> = ({
  generatedCode,
  securityIssues,
  gasEstimates,
  onClose,
}) => {
  return (
    <div className="h-96 bg-gray-900 text-green-400 border-t flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5" />
              Generated Solidity Code
            </h3>
            <p className="text-sm text-gray-400">Ready for deployment • Solidity ^0.8.19</p>
          </div>
          
          {securityIssues.length > 0 && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">
                {securityIssues.length} security consideration{securityIssues.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {gasEstimates.deployment && (
            <div className="text-sm text-gray-400 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Deployment: ~{gasEstimates.deployment.toLocaleString()} gas</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
              }}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              Copy Code
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <pre className="whitespace-pre-wrap">{generatedCode}</pre>
      </div>

      {securityIssues.length > 0 && (
        <div className="border-t border-gray-700 p-4 bg-yellow-900/20">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-yellow-400" />
            <h4 className="text-yellow-400 font-medium">Security Considerations</h4>
          </div>
          <div className="space-y-2">
            {securityIssues.map((issue, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                {issue.severity === 'high' && (
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                )}
                {issue.severity === 'medium' && (
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                )}
                {issue.severity === 'low' && (
                  <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                )}
                <span className="text-gray-300">{issue.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedCodePanel;