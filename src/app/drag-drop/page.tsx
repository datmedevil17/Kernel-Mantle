'use client'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Download, Upload, Save, FolderOpen, Settings, Eye, Code, Play, Zap, Shield, Database, Radio, Map, Cpu, Gift, Lock, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Component,Connection,CanvasState,GasEstimates,SecurityIssue } from '@/types';
import { componentLibrary,categories } from '@/constants/componentLibrary';
import GeneratedCodePanel from '@/components/GeneratedCodePanel';
import PropertiesPanel from '@/components/PropertiesPanel';
import Canvas from '@/components/Canvas';


const AdvancedSmartContractBuilder = () => {


  const [canvasComponents, setCanvasComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [connections, setConnections] = useState<Connection[]>([]);
  const [projectName, setProjectName] = useState('MySmartContract');
  const [compilationErrors, setCompilationErrors] = useState([]);
  const [codeAnalysis, setCodeAnalysis] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [gasEstimates, setGasEstimates] = useState<GasEstimates>({ deployment: 0, functions: 0, storage: 0 });
  const [securityIssues, setSecurityIssues] = useState<SecurityIssue[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;
  const [undoStack, setUndoStack] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);

  // Enhanced component library with categories


  // Save state for undo/redo
  const saveState = useCallback(() => {
    const state = {
      canvasComponents: [...canvasComponents],
      connections: [...connections],
      timestamp: Date.now()
    };
    setUndoStack(prev => [...prev.slice(-19), state]);
    setRedoStack([]);
  }, [canvasComponents, connections]);

  // Undo/Redo functionality
  const undo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    const currentState = {
      canvasComponents: [...canvasComponents],
      connections: [...connections],
      timestamp: Date.now()
    };
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    setCanvasComponents(previousState.canvasComponents);
    setConnections(previousState.connections);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    const currentState = {
      canvasComponents: [...canvasComponents],
      connections: [...connections],
      timestamp: Date.now()
    };
    setUndoStack(prev => [...prev, currentState]);
    setRedoStack(prev => prev.slice(0, -1));
    setCanvasComponents(nextState.canvasComponents);
    setConnections(nextState.connections);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportProject();
      }
      if (e.key === 'Delete' && selectedComponent) {
        removeComponent(selectedComponent.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedComponent, canvasComponents, connections]);

  // Enhanced component filtering
  const filteredComponents = componentLibrary.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Generate unique ID
  const generateId = () => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: Component) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedComponent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvasOffset.x) / canvasScale;
    const y = (e.clientY - rect.top - canvasOffset.y) / canvasScale;

    const newComponent: Component = {
      ...draggedComponent,
      id: generateId(),
      originalId: draggedComponent.id,
      x: Math.max(0, x - 90),
      y: Math.max(0, y - 30)
    };

    saveState();
    setCanvasComponents(prev => [...prev, newComponent]);
    setDraggedComponent(null);
    setSelectedComponent(newComponent);
  };

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Component selection and movement
  const handleComponentClick = (component: Component, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedComponent(component);
  };

  // Update component properties?.visibility
  const updateComponentProperty = (componentId: string, property: string, value: any) => {
    setCanvasComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? {
              ...comp,
              properties: {
                ...comp.properties,
                visibility: {
                  ...comp.properties.visibility,
                  [property]: value
                }
              }
            }
          : comp
      )
    );
    
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          properties: {
            ...prev.properties,
            visibility: {
              ...prev.properties.visibility,
              [property]: value
            }
          }
        };
      });
    }
  };

  // Remove component
  const removeComponent = (componentId: string) => {
    saveState();
    setCanvasComponents(prev => prev.filter(comp => comp.id !== componentId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== componentId && conn.to !== componentId
    ));
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(null);
    }
  };

  // Security analysis
  const analyzeSecurityIssues = () => {
    const issues = [];
    
    // Check for reentrancy protection
    const hasReentrancyGuard = canvasComponents.some(comp => 
      comp.originalId === 'reentrancy-guard'
    );
    const hasPayableFunctions = canvasComponents.some(comp => 
      comp.properties?.visibility?.payable === true
    );
    
    if (hasPayableFunctions && !hasReentrancyGuard) {
      issues.push({
        type: 'warning',
        message: 'Consider adding reentrancy protection for payable functions',
        severity: 'medium' as const
      });
    }

    // Check for access control
    const hasAccessControl = canvasComponents.some(comp => 
      comp.category === 'security' && comp.type === 'modifier'
    );
    const hasCriticalFunctions = canvasComponents.some(comp => 
      comp.type === 'function' && comp.properties?.visibility?.visibility === 'public'
    );
    
    if (hasCriticalFunctions && !hasAccessControl) {
      issues.push({
        type: 'warning',
        message: 'Consider adding access control to public functions',
        severity: 'high' as const
      });
    }

    // Check for integer overflow protection
    const hasArithmeticOperations = canvasComponents.some(comp => 
      comp.properties?.visibility?.functionBody?.includes('+=') || 
      comp.properties?.visibility?.functionBody?.includes('-=')
    );
    
    if (hasArithmeticOperations) {
      issues.push({
        type: 'info',
        message: 'Using Solidity ^0.8.0 provides built-in overflow protection',
        severity: 'low' as const
      });
    }

    setSecurityIssues(issues);
  };

  // Enhanced Solidity code generation
  const generateAdvancedSolidityCode = () => {
    let code = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\n`;
    
    // Add imports based on components
    const imports = new Set();
    canvasComponents.forEach(comp => {
      if (comp.originalId === 'access-control') imports.add('@openzeppelin/contracts/access/Ownable.sol');
      if (comp.originalId === 'reentrancy-guard') imports.add('@openzeppelin/contracts/security/ReentrancyGuard.sol');
      if (comp.originalId === 'erc20-advanced') imports.add('@openzeppelin/contracts/token/ERC20/ERC20.sol');
      if (comp.originalId === 'erc721') imports.add('@openzeppelin/contracts/token/ERC721/ERC721.sol');
    });
    
    imports.forEach(imp => {
      code += `import "${imp}";\n`;
    });
    
    if (imports.size > 0) code += '\n';
    
    // Add structs first
    const structs = canvasComponents.filter(comp => comp.type === 'struct');
    structs.forEach(struct => {
      code += `struct ${struct.properties?.visibility.name} {\n`;
      const fields = struct.properties?.visibility.fields.split(';').filter((f: string) => f.trim());
      fields.forEach((field: string) => {
        code += `    ${field.trim()};\n`;
      });
      code += `}\n\n`;
    });

    // Contract declaration with inheritance
    let inheritance = [];
    if (canvasComponents.some(comp => comp.originalId === 'access-control')) inheritance.push('Ownable');
    if (canvasComponents.some(comp => comp.originalId === 'reentrancy-guard')) inheritance.push('ReentrancyGuard');
    if (canvasComponents.some(comp => comp.originalId === 'erc20-advanced')) inheritance.push('ERC20');
    if (canvasComponents.some(comp => comp.originalId === 'erc721')) inheritance.push('ERC721');
    
    const inheritanceStr = inheritance.length > 0 ? ` is ${inheritance.join(', ')}` : '';
    code += `contract ${projectName}${inheritanceStr} {\n`;

    // Add state variables
    const variables = canvasComponents.filter(comp => comp.type === 'variable');
    variables.forEach(variable => {
      const constModifier = variable.properties?.visibility.constant ? 'constant ' : '';
      const immutableModifier = variable.properties?.visibility.immutable ? 'immutable ' : '';
      
      if (variable.originalId === 'nested-mapping') {
        code += `    mapping(${variable.properties?.visibility.keyType1} => mapping(${variable.properties?.visibility.keyType2} => ${variable.properties?.visibility.valueType})) ${variable.properties?.visibility.visibility} ${variable.properties?.visibility.name};\n`;
      } else if (variable.originalId === 'mapping') {
        code += `    mapping(${variable.properties?.visibility.keyType} => ${variable.properties?.visibility.valueType}) ${variable.properties?.visibility.visibility} ${variable.properties?.visibility.name};\n`;
      } else {
        code += `    ${variable.properties?.visibility.dataType} ${constModifier}${immutableModifier}${variable.properties?.visibility.visibility} ${variable.properties?.visibility.name}`;
        if (variable.properties?.visibility.defaultValue && variable.properties?.visibility.defaultValue !== '0') {
          code += ` = ${variable.properties?.visibility.defaultValue}`;
        }
        code += `;\n`;
      }
    });

    // Add events
    const events = canvasComponents.filter(comp => comp.type === 'event');
    events.forEach(event => {
      const anonymous = event.properties?.visibility.anonymous ? 'anonymous ' : '';
      code += `    event ${anonymous}${event.properties?.visibility.name}(${event.properties?.visibility.parameters});\n`;
    });

    if (variables.length > 0 || events.length > 0) code += '\n';

    // Add constructor
    const constructor = canvasComponents.find(comp => comp.originalId === 'constructor');
    if (constructor) {
      const params = constructor?.properties?.visibility?.parameters || '';
      const payableKeyword = constructor?.properties?.visibility?.payable ? ' payable' : '';
      code += `    constructor(${params})${payableKeyword} {\n`;
      code += `        ${constructor?.properties?.visibility?.initCode || '// Constructor logic here'}\n`;
      code += `    }\n\n`;
    }

    // Add modifiers
    const modifiers = canvasComponents.filter(comp => comp.type === 'modifier');
    modifiers.forEach(modifier => {
      if (modifier.originalId === 'reentrancy-guard') {
        // Skip - handled by inheritance
      } else if (modifier.originalId === 'time-lock') {
        code += `    modifier ${modifier.properties?.visibility?.name || 'timeLock'}(uint256 releaseTime) {\n`;
        code += `        require(${modifier.properties?.visibility.timeCondition.replace('releaseTime', 'releaseTime')}, "${modifier.properties?.visibility.description}");\n`;
        code += `        _;\n`;
        code += `    }\n\n`;
      } else if (modifier.originalId === 'multi-sig') {
        code += `    modifier ${modifier.properties?.visibility?.name || 'multiSigRequired'}(bytes32 proposalId) {\n`;
        code += `        require(getApprovalCount(proposalId) >= ${modifier.properties?.visibility?.requiredSignatures || '2'}, "Insufficient signatures");\n`;
        code += `        _;\n`;
        code += `    }\n\n`;
      } else {
        code += `    modifier ${modifier.properties?.visibility?.name || 'customModifier'}() {\n`;
        code += `        require(${modifier.properties?.visibility?.condition || 'true'}, "${modifier.properties?.visibility?.errorMessage || 'Access denied'}");\n`;
        code += `        _;\n`;
        code += `    }\n\n`;
      }
    });

    // Add functions
    const functions = canvasComponents.filter(comp => comp.type === 'function');
    functions.forEach(func => {
      if (func.originalId === 'constructor') return; // Skip constructor
      
      let functionSignature = `function ${func.properties?.visibility.name}(`;
      if (func.properties?.visibility.parameters) {
        functionSignature += func.properties?.visibility.parameters;
      }
      functionSignature += ')';
      
      // Add visibility
      functionSignature += ` ${func.properties?.visibility || 'public'}`;
      
      // Add state mutability
      if (func.properties?.visibility.view) functionSignature += ' view';
      if (func.properties?.visibility.pure) functionSignature += ' pure';
      if (func.properties?.visibility.payable) functionSignature += ' payable';
      
      // Add modifiers
      if (func.properties?.visibility.modifiers) {
        functionSignature += ` ${func.properties?.visibility.modifiers}`;
      }
      
      // Add returns
      if (func.properties?.visibility.returns) {
        functionSignature += ` returns (${func.properties?.visibility.returns})`;
      }
      
      code += `    ${functionSignature} {\n`;
      
      // Add function body
      if (func.properties?.visibility.functionBody) {
        const lines = func.properties?.visibility.functionBody.split('\n');
        lines.forEach((line: string) => {
          if (line.trim()) code += `        ${line}\n`;
        });
      } else {
        code += `        // Function logic here\n`;
      }
      
      code += `    }\n\n`;
    });

    // Add template implementations
    const templates = canvasComponents.filter(comp => comp.type === 'template');
    templates.forEach(template => {
      if (template.originalId === 'erc20-advanced' && template.properties?.visibility) {
        // ERC20 is handled by inheritance, add custom functions
        if (template.properties?.visibility.mintable) {
          code += `    function mint(address to, uint256 amount) public onlyOwner {\n`;
          code += `        require(totalSupply() + amount <= ${template.properties?.visibility.maxSupply} * 10**decimals(), "Max supply exceeded");\n`;
          code += `        _mint(to, amount);\n`;
          code += `    }\n\n`;
        }
        
        if (template.properties?.visibility.burnable) {
          code += `    function burn(uint256 amount) public {\n`;
          code += `        _burn(msg.sender, amount);\n`;
          code += `    }\n\n`;
        }
      } else if (template.originalId === 'liquidity-pool') {
        code += `    // Liquidity Pool Implementation\n`;
        code += `    uint256 public constant MINIMUM_LIQUIDITY = ${template.properties?.visibility?.minLiquidity || '1000'};\n`;
        code += `    uint256 public fee = ${(template.properties?.visibility?.fee || 0.3) * 100}; // ${template.properties?.visibility?.fee || '0.3'}%\n\n`;
        
        code += `    function addLiquidity(uint256 amountA, uint256 amountB) external {\n`;
        code += `        // Add liquidity logic here\n`;
        code += `        require(amountA > 0 && amountB > 0, "Invalid amounts");\n`;
        code += `    }\n\n`;
        
        code += `    function swap(uint256 amountIn, address tokenIn, uint256 minAmountOut) external {\n`;
        code += `        // Swap logic with slippage protection\n`;
        code += `        require(amountIn > 0, "Invalid input amount");\n`;
        code += `    }\n\n`;
      }
    });

    code += `}`;
    
    setGeneratedCode(code);
    analyzeSecurityIssues();
    
    // Calculate gas estimates
    const totalGas = canvasComponents.reduce((total, comp) => total + (comp.gasEstimate || 0), 0);
    setGasEstimates({
      deployment: totalGas,
      functions: canvasComponents.filter(c => c.type === 'function').length * 21000,
      storage: canvasComponents.filter(c => c.type === 'variable').length * 20000
    });
  };

  // Project management
  const exportProject = () => {
    const projectData = {
      name: projectName,
      version: '1.0.0',
      components: canvasComponents,
      connections: connections,
      generatedCode: generatedCode,
      createdAt: new Date().toISOString(),
      gasEstimates: gasEstimates
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result || typeof e.target.result !== 'string') return;
        const projectData = JSON.parse(e.target.result);
        setProjectName(projectData.name || 'ImportedProject');
        setCanvasComponents(projectData.components || []);
        setConnections(projectData.connections || []);
        setGeneratedCode(projectData.generatedCode || '');
        setGasEstimates(projectData.gasEstimates || {});
      } catch (error) {
        alert('Error importing project: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  // Clear canvas
  const clearCanvas = () => {
    if (canvasComponents.length > 0) {
      saveState();
    }
    setCanvasComponents([]);
    setConnections([]);
    setSelectedComponent(null);
    setGeneratedCode('');
    setSecurityIssues([]);
    setGasEstimates({});
  };

  // Canvas zoom and pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setCanvasScale(prev => Math.min(Math.max(prev * delta, 0.1), 3));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Enhanced Sidebar */}
      <div className="w-80 bg-white shadow-2xl border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <h2 className="text-xl font-bold mb-2">Component Library</h2>
          <p className="text-sm opacity-90 mb-4">Drag components to build your contract</p>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Component List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              className={`group p-4 rounded-xl border-2 cursor-move transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${component.color}`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-white/50 group-hover:bg-white/80 transition-colors">
                  {component.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-800">{component.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{component.description}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 capitalize bg-white/60 px-2 py-1 rounded">
                      {component.type}
                    </span>
                    <span className="text-xs text-green-600 font-medium">
                      ⛽ {component.gasEstimate?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No components found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-white p-4 border-b shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Advanced Smart Contract Builder</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none px-1"
                  />
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {canvasComponents.length} components
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Undo/Redo */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title="Undo (Ctrl+Z)"
                >
                  ↶
                </button>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-l"
                  title="Redo (Ctrl+Y)"
                >
                  ↷
                </button>
              </div>

              {/* File Operations */}
              <div className="flex space-x-2">
                <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-all text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProject}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={exportProject}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Main Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={generateAdvancedSolidityCode}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  Generate Code
                </button>
                
                <button
                  onClick={clearCanvas}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          {(gasEstimates.deployment || securityIssues.length > 0) && (
            <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-6">
                {gasEstimates.deployment && (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      Est. Gas: <span className="font-medium">{gasEstimates.deployment?.toLocaleString()}</span>
                    </span>
                  </div>
                )}
                
                {securityIssues.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      {securityIssues.length} security {securityIssues.length === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Zoom: {Math.round(canvasScale * 100)}%</span>
                <button
                  onClick={() => setCanvasScale(1)}
                  className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex">
          {/* Enhanced Canvas */}
           <Canvas
            canvasRef={canvasRef}
            canvasComponents={canvasComponents}
            connections={connections}
            selectedComponent={selectedComponent}
            canvasScale={canvasScale}
            canvasOffset={canvasOffset}
            handleCanvasDrop={handleCanvasDrop}
            handleCanvasDragOver={handleCanvasDragOver}
            handleWheel={handleWheel}
            handleComponentClick={handleComponentClick}
            setSelectedComponent={setSelectedComponent}
            removeComponent={removeComponent}
          />
          {/* Enhanced Properties Panel */}
         {selectedComponent && (
  <PropertiesPanel
    selectedComponent={selectedComponent}
    onClose={() => setSelectedComponent(null)}
    updateComponentProperty={updateComponentProperty}
  />
)}
        </div>

        {/* Enhanced Generated Code Panel */}
       {generatedCode && (
  <GeneratedCodePanel
    generatedCode={generatedCode}
    securityIssues={securityIssues}
    gasEstimates={gasEstimates}
    onClose={() => setGeneratedCode('')}
  />
)}
      </div>
    </div>
  );
};

export default AdvancedSmartContractBuilder;
