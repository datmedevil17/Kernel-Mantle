import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Component, Connection } from '@/types';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  canvasComponents: Component[];
  connections: Connection[];
  selectedComponent: Component | null;
  canvasScale: number;
  canvasOffset: { x: number; y: number };
  handleCanvasDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleCanvasDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleWheel: (e: React.WheelEvent) => void;
  handleComponentClick: (component: Component, e: React.MouseEvent) => void;
  setSelectedComponent: (component: Component | null) => void;
  removeComponent: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  canvasRef,
  canvasComponents,
  connections,
  selectedComponent,
  canvasScale,
  canvasOffset,
  handleCanvasDrop,
  handleCanvasDragOver,
  handleWheel,
  handleComponentClick,
  setSelectedComponent,
  removeComponent,
}) => {
  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 overflow-hidden"
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
      onWheel={handleWheel}
      onClick={() => setSelectedComponent(null)}
      style={{ 
        minHeight: '600px',
        transform: `scale(${canvasScale}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
        transformOrigin: 'top left'
      }}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Connection Lines */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {connections.map((connection, index) => (
          <ConnectionLine
            key={index}
            connection={connection}
            canvasComponents={canvasComponents}
          />
        ))}
      </svg>

      {/* Canvas Components */}
      {canvasComponents.map((component) => (
        <CanvasComponent
          key={component.id}
          component={component}
          selectedComponent={selectedComponent}
          handleComponentClick={handleComponentClick}
          removeComponent={removeComponent}
        />
      ))}

      {/* Empty State */}
      {canvasComponents.length === 0 && <EmptyState />}
    </div>
  );
};

// Helper Components
const ConnectionLine: React.FC<{
  connection: Connection;
  canvasComponents: Component[];
}> = ({ connection, canvasComponents }) => {
  const fromComponent = canvasComponents.find(c => c.id === connection.from);
  const toComponent = canvasComponents.find(c => c.id === connection.to);
  
  if (!fromComponent || !toComponent) return null;
  
  return (
    <line
      x1={(fromComponent.x ?? 0) + 90}
      y1={(fromComponent.y ?? 0) + 30}
      x2={(toComponent.x ?? 0) + 90}
      y2={(toComponent.y ?? 0) + 30}
      stroke="#3b82f6"
      strokeWidth="2"
      strokeDasharray="5,5"
      opacity="0.6"
    />
  );
};

const CanvasComponent: React.FC<{
  component: Component;
  selectedComponent: Component | null;
  handleComponentClick: (component: Component, e: React.MouseEvent) => void;
  removeComponent: (id: string) => void;
}> = ({ component, selectedComponent, handleComponentClick, removeComponent }) => {
  return (
    <div
      onClick={(e) => handleComponentClick(component, e)}
      className={`absolute p-4 rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-2xl transform hover:scale-105 ${
        selectedComponent?.id === component.id 
          ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-2xl scale-105' 
          : ''
      } ${component.color}`}
      style={{ 
        left: component.x, 
        top: component.y,
        minWidth: '200px',
        zIndex: selectedComponent?.id === component.id ? 10 : 2,
        backdropFilter: 'blur(8px)'
      }}
    >
      <ComponentHeader 
        component={component} 
        removeComponent={removeComponent} 
      />
      <ComponentBody component={component} />
      <ComponentStatusIndicators 
        component={component} 
        isSelected={selectedComponent?.id === component.id} 
      />
    </div>
  );
};

const ComponentHeader: React.FC<{
  component: Component;
  removeComponent: (id: string) => void;
}> = ({ component, removeComponent }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-lg bg-white/60">
        {component.icon}
      </div>
      <div>
        <div className="font-semibold text-sm text-gray-800">{component.name}</div>
        <div className="text-xs text-gray-600 capitalize flex items-center gap-2">
          {component.type}
          {component.gasEstimate && (
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
              ⛽ {component.gasEstimate.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        removeComponent(component.id);
      }}
      className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-all"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

const ComponentBody: React.FC<{ component: Component }> = ({ component }) => (
  <div className="text-xs text-gray-700 bg-white/40 rounded-lg p-2">
    {renderComponentContent(component)}
  </div>
);

const ComponentStatusIndicators: React.FC<{
  component: Component;
  isSelected: boolean;
}> = ({ component, isSelected }) => (
  <div className="flex items-center justify-between mt-2">
    <div className="flex space-x-1">
      {component.properties?.visibility?.payable && (
        <span className="w-2 h-2 bg-yellow-400 rounded-full" title="Payable" />
      )}
      {component.properties?.visibility?.view && (
        <span className="w-2 h-2 bg-blue-400 rounded-full" title="View Function" />
      )}
      {component.category === 'security' && (
        <span className="w-2 h-2 bg-red-400 rounded-full" title="Security Component" />
      )}
    </div>
    
    {isSelected && (
      <CheckCircle className="w-4 h-4 text-blue-500" />
    )}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
    <div className="text-center max-w-2xl">
      <div className="text-9xl mb-8 animate-bounce">🚀</div>
      <div className="text-3xl font-bold mb-4 text-gray-600">
        Start Building Amazing Smart Contracts
      </div>
      <QuickStartGuide />
    </div>
  </div>
);

const QuickStartGuide: React.FC = () => (
  <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl mx-auto">
    <div className="font-semibold mb-4 text-gray-700">🎯 Quick Start Guide:</div>
    <div className="text-left space-y-3 text-sm">
      {quickStartSteps.map((step, index) => (
        <QuickStartStep key={index} {...step} index={index + 1} />
      ))}
    </div>
  </div>
);

const quickStartSteps = [
  {
    color: 'blue',
    text: 'Add a Constructor to initialize your contract'
  },
  {
    color: 'green',
    text: 'Create State Variables to store data'
  },
  {
    color: 'purple',
    text: 'Add Functions for contract logic'
  },
  {
    color: 'orange',
    text: 'Include Security components for protection'
  },
  {
    color: 'teal',
    text: 'Click Generate Code to see your Solidity contract'
  }
];

const QuickStartStep: React.FC<{
  color: string;
  text: string;
  index: number;
}> = ({ color, text, index }) => (
  <div className="flex items-center space-x-3">
    <span className={`w-6 h-6 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center text-xs font-bold`}>
      {index}
    </span>
    <span dangerouslySetInnerHTML={{ 
      __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
    }} />
  </div>
);

const renderComponentContent = (component: Component): string => {
  if (!component.properties?.visibility) {
    return 'Click to configure';
  }

  if (component.type === 'variable' && component.originalId === 'nested-mapping') {
    const { name, keyType1, keyType2, valueType } = component.properties.visibility;
    return `${name}: ${keyType1} → ${keyType2} → ${valueType}`;
  }
  
  if (component.type === 'variable' && component.originalId === 'mapping') {
    const { name, keyType, valueType } = component.properties.visibility;
    return `${name}: ${keyType} → ${valueType}`;
  }
  
  if (component.type === 'function') {
    const { name, visibility, payable, view } = component.properties.visibility;
    return `${name}() ${visibility}${payable ? ' payable' : ''}${view ? ' view' : ''}`;
  }
  
  if (component.type === 'struct') {
    return `struct ${component.properties.visibility.name}`;
  }

  return component.properties.visibility.name || 'Click to configure';
};

export default Canvas;