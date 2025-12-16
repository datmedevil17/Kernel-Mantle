import React from 'react';
import { X, Info, Zap } from 'lucide-react';
import { Component } from '@/types';

interface PropertiesPanelProps {
  selectedComponent: Component | null;
  onClose: () => void;
  updateComponentProperty: (componentId: string, key: string, value: any) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  onClose,
  updateComponentProperty,
}) => {
  if (!selectedComponent) return null;

  return (
    <div className="w-96 bg-white border-l shadow-2xl flex flex-col">
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              {selectedComponent.icon}
            </div>
            <span>{selectedComponent.name}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full p-2 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 capitalize bg-white px-3 py-1 rounded-full">
            {selectedComponent.type}
          </span>
          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
            {selectedComponent.category}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{selectedComponent.description}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {Object.entries(selectedComponent.properties?.visibility || {}).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').replace(/([0-9])/g, ' $1').trim()}
            </label>
            
            {renderPropertyInput(key, value, selectedComponent, updateComponentProperty)}
          </div>
        ))}
        
        <BestPractices selectedComponent={selectedComponent} />
        <GasEstimation gasEstimate={selectedComponent.gasEstimate} />
      </div>
    </div>
  );
};

const renderPropertyInput = (
  key: string,
  value: any,
  selectedComponent: Component,
  updateComponentProperty: (componentId: string, key: string, value: any) => void
) => {
  if (key === 'visibility') {
    return (
      <select
        value={String(value)}
        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
      >
        <option value="public">Public</option>
        <option value="private">Private</option>
        <option value="internal">Internal</option>
        <option value="external">External</option>
      </select>
    );
  }

  if (key === 'dataType') {
    return (
      <select
        value={String(value)}
        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
      >
        <option value="uint256">uint256</option>
        <option value="int256">int256</option>
        <option value="address">address</option>
        <option value="bool">bool</option>
        <option value="string">string</option>
        <option value="bytes32">bytes32</option>
        <option value="uint8">uint8</option>
        <option value="uint128">uint128</option>
      </select>
    );
  }

  if (['keyType', 'valueType', 'keyType1', 'keyType2'].includes(key)) {
    return (
      <select
        value={String(value)}
        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
      >
        <option value="address">address</option>
        <option value="uint256">uint256</option>
        <option value="string">string</option>
        <option value="bytes32">bytes32</option>
        <option value="bool">bool</option>
      </select>
    );
  }

  if (['payable', 'constant', 'immutable', 'view', 'pure', 'anonymous', 'mintable', 'burnable', 'pausable'].includes(key)) {
    return (
      <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.checked)}
          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm font-medium">
          {getPropertyLabel(key)}
        </span>
      </label>
    );
  }

  if (['functionBody', 'initCode', 'fields'].includes(key)) {
    return (
      <textarea
        value={String(value)}
        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-mono text-sm"
        rows={4}
        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
      />
    );
  }

  return (
    <input
      type="text"
      value={String(value)}
      onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
      placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
    />
  );
};

const BestPractices: React.FC<{ selectedComponent: Component }> = ({ selectedComponent }) => (
  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
    <div className="flex items-start space-x-3">
      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-800">
        <strong>💡 Best Practices:</strong>
        <ul className="mt-2 space-y-1 text-xs">
          {getBestPractices(selectedComponent)}
        </ul>
      </div>
    </div>
  </div>
);

const GasEstimation: React.FC<{ gasEstimate?: number }> = ({ gasEstimate }) => {
  if (!gasEstimate) return null;
  
  return (
    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
      <div className="flex items-center space-x-2 mb-2">
        <Zap className="w-4 h-4 text-yellow-600" />
        <span className="text-sm font-semibold text-yellow-800">Gas Estimation</span>
      </div>
      <div className="text-sm text-yellow-700">
        Estimated gas cost: <span className="font-mono font-bold">{gasEstimate.toLocaleString()}</span> gas
      </div>
    </div>
  );
};

const getPropertyLabel = (key: string): string => {
  const labels: Record<string, string> = {
    payable: 'Function can receive Ether',
    constant: 'Value cannot be changed',
    immutable: 'Set once in constructor',
    view: 'Read-only function',
    pure: 'No state access',
    anonymous: 'Anonymous event',
    mintable: 'Allow token minting',
    burnable: 'Allow token burning',
    pausable: 'Contract can be paused'
  };
  return labels[key] || key;
};

const getBestPractices = (component: Component) => {
  if (component.type === 'function') {
    return (
      <>
        <li>• Use 'external' for functions called by users</li>
        <li>• Add proper access control modifiers</li>
        <li>• Include input validation with require()</li>
      </>
    );
  }
  if (component.type === 'variable') {
    return (
      <>
        <li>• Use 'private' for internal data</li>
        <li>• Consider gas costs for storage operations</li>
        <li>• Use appropriate data types to save gas</li>
      </>
    );
  }
  if (component.category === 'security') {
    return (
      <>
        <li>• Always test security components thoroughly</li>
        <li>• Follow established security patterns</li>
        <li>• Consider professional security audits</li>
      </>
    );
  }
  if (component.type === 'template') {
    return (
      <>
        <li>• Templates provide battle-tested implementations</li>
        <li>• Customize properties to fit your needs</li>
        <li>• Review generated code before deployment</li>
      </>
    );
  }
  return null;
};

export default PropertiesPanel;