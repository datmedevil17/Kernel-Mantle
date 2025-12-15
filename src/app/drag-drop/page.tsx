'use client'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Download, Upload, Save, FolderOpen, Settings, Eye, Code, Play, Zap, Shield, Database, Radio, Map, Cpu, Gift, Lock, Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const AdvancedSmartContractBuilder = () => {
  interface Component {
    id: string;
    type: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    category: string;
    description: string;
    gasEstimate?: number;
    originalId?: string;
    x?: number;
    y?: number;
    properties: {
      [key: string]: any;
    };
  }

  interface SecurityIssue {
    type: string;
    message: string;
    severity: 'high' | 'medium' | 'low';
  }

  interface GasEstimates {
    deployment?: number;
    functions?: number;
    storage?: number;
  }

  interface Connection {
    from: string;
    to: string;
  }

  interface CanvasState {
    canvasComponents: Component[];
    connections: Connection[];
    timestamp: number;
  }

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [undoStack, setUndoStack] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);

  // Enhanced component library with categories
  const componentLibrary = [
    // Core Components
    {
      id: 'constructor',
      type: 'function',
      category: 'core',
      name: 'Constructor',
      icon: <Cpu className="w-5 h-5" />,
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
      description: 'Initialize contract state',
      gasEstimate: 21000,
      properties: { 
        visibility: {
          type: 'public',
          payable: false, 
          parameters: '',
          initCode: '// Initialize your contract here'
        }
      }
    },
    {
      id: 'state-variable',
      type: 'variable',
      category: 'storage',
      name: 'State Variable',
      icon: <Database className="w-5 h-5" />,
      color: 'bg-green-100 border-green-300 hover:bg-green-200',
      description: 'Store data on blockchain',
      gasEstimate: 20000,
      properties: { 
        dataType: 'uint256', 
        visibility: 'public', 
        name: 'myVariable',
        defaultValue: '0',
        constant: false,
        immutable: false
      }
    },
    // Advanced Functions
    {
      id: 'payable-function',
      type: 'function',
      category: 'finance',
      name: 'Payable Function',
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200',
      description: 'Function that can receive Ether',
      gasEstimate: 23000,
      properties: { 
        name: 'deposit', 
        visibility: 'external', 
        payable: true, 
        returns: '',
        minAmount: '0.01 ether',
        functionBody: 'require(msg.value >= minAmount, "Minimum amount required");'
      }
    },
    {
      id: 'view-function',
      type: 'function',
      category: 'core',
      name: 'View Function',
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
      description: 'Read-only function',
      gasEstimate: 0,
      properties: { 
        name: 'getBalance', 
        visibility: 'public', 
        view: true,
        returns: 'uint256',
        functionBody: 'return address(this).balance;'
      }
    },
    // Access Control
    {
      id: 'access-control',
      type: 'modifier',
      category: 'security',
      name: 'Access Control',
      icon: <Lock className="w-5 h-5" />,
      color: 'bg-red-100 border-red-300 hover:bg-red-200',
      description: 'Role-based permissions',
      gasEstimate: 2300,
      properties: { 
        name: 'onlyOwner', 
        condition: 'msg.sender == owner',
        errorMessage: 'Only owner can call this function',
        roleType: 'owner'
      }
    },
    {
      id: 'multi-sig',
      type: 'modifier',
      category: 'security',
      name: 'Multi-Signature',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
      description: 'Require multiple approvals',
      gasEstimate: 5000,
      properties: { 
        name: 'requireMultipleSignatures',
        requiredSignatures: '2',
        signers: 'address[] memory signers',
        proposalId: 'bytes32'
      }
    },
    // Events and Oracles
    {
      id: 'indexed-event',
      type: 'event',
      category: 'events',
      name: 'Indexed Event',
      icon: <Radio className="w-5 h-5" />,
      color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
      description: 'Searchable blockchain event',
      gasEstimate: 1500,
      properties: { 
        name: 'Transfer', 
        parameters: 'address indexed from, address indexed to, uint256 value',
        indexed: true,
        anonymous: false
      }
    },
    // Advanced Storage
    {
      id: 'nested-mapping',
      type: 'variable',
      category: 'storage',
      name: 'Nested Mapping',
      icon: <Map className="w-5 h-5" />,
      color: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200',
      description: 'Complex data relationships',
      gasEstimate: 20000,
      properties: { 
        name: 'allowances',
        keyType1: 'address',
        keyType2: 'address', 
        valueType: 'uint256',
        visibility: 'public',
        description: 'owner => spender => amount'
      }
    },
    {
      id: 'struct',
      type: 'struct',
      category: 'storage',
      name: 'Struct',
      icon: <Database className="w-5 h-5" />,
      color: 'bg-teal-100 border-teal-300 hover:bg-teal-200',
      description: 'Custom data structure',
      gasEstimate: 0,
      properties: { 
        name: 'User',
        fields: 'address wallet; uint256 balance; bool active; string name',
        visibility: 'public'
      }
    },
    // Time-based
    {
      id: 'time-lock',
      type: 'modifier',
      category: 'time',
      name: 'Time Lock',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
      description: 'Time-based restrictions',
      gasEstimate: 2100,
      properties: { 
        name: 'onlyAfter',
        timeCondition: 'block.timestamp >= releaseTime',
        releaseTime: '1 days',
        description: 'Only executable after specified time'
      }
    },
    // DeFi Components
    {
      id: 'liquidity-pool',
      type: 'template',
      category: 'defi',
      name: 'Liquidity Pool',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-rose-100 border-rose-300 hover:bg-rose-200',
      description: 'AMM liquidity pool logic',
      gasEstimate: 150000,
      properties: { 
        tokenA: 'USDC',
        tokenB: 'ETH',
        fee: '0.3',
        slippage: '0.5',
        minLiquidity: '1000'
      }
    },
    // Security Components
    {
      id: 'reentrancy-guard',
      type: 'modifier',
      category: 'security',
      name: 'Reentrancy Guard',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-gray-100 border-gray-300 hover:bg-gray-200',
      description: 'Prevent reentrancy attacks',
      gasEstimate: 2300,
      properties: { 
        name: 'nonReentrant',
        status: '_status',
        entered: '_ENTERED',
        notEntered: '_NOT_ENTERED'
      }
    },
    // Token Standards
    {
      id: 'erc20-advanced',
      type: 'template',
      category: 'tokens',
      name: 'ERC-20 Advanced',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-cyan-100 border-cyan-300 hover:bg-cyan-200',
      description: 'Full ERC-20 with extensions',
      gasEstimate: 500000,
      properties: { 
        name: 'MyToken', 
        symbol: 'MTK', 
        supply: '1000000',
        decimals: '18',
        mintable: true,
        burnable: true,
        pausable: false,
        maxSupply: '10000000'
      }
    },
    {
      id: 'erc721',
      type: 'template',
      category: 'tokens',
      name: 'ERC-721 NFT',
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-pink-100 border-pink-300 hover:bg-pink-200',
      description: 'Non-Fungible Token standard',
      gasEstimate: 800000,
      properties: { 
        name: 'MyNFT', 
        symbol: 'MNFT',
        baseURI: 'https://api.mynft.com/metadata/',
        maxSupply: '10000',
        mintPrice: '0.08',
        royaltyFee: '5'
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Components', icon: <Settings className="w-4 h-4" /> },
    { id: 'core', name: 'Core', icon: <Cpu className="w-4 h-4" /> },
    { id: 'storage', name: 'Storage', icon: <Database className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'finance', name: 'Finance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'tokens', name: 'Tokens', icon: <Zap className="w-4 h-4" /> },
    { id: 'defi', name: 'DeFi', icon: <Gift className="w-4 h-4" /> },
    { id: 'events', name: 'Events', icon: <Radio className="w-4 h-4" /> },
    { id: 'time', name: 'Time', icon: <Calendar className="w-4 h-4" /> }
  ];

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
        code += `    modifier ${modifier.properties?.visibility.name}(bytes32 proposalId) {\n`;
        code += `        require(getApprovalCount(proposalId) >= ${modifier.properties?.visibility.requiredSignatures}, "Insufficient signatures");\n`;
        code += `        _;\n`;
        code += `    }\n\n`;
      } else {
        code += `    modifier ${modifier.properties?.visibility.name}() {\n`;
        code += `        require(${modifier.properties?.visibility.condition}, "${modifier.properties?.visibility.errorMessage || 'Access denied'}");\n`;
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
        code += `    uint256 public constant MINIMUM_LIQUIDITY = ${template.properties?.visibility.minLiquidity};\n`;
        code += `    uint256 public fee = ${template.properties?.visibility.fee * 100}; // ${template.properties?.visibility.fee}%\n\n`;
        
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
            {/* Enhanced Grid Pattern */}
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
              {connections.map((connection, index) => {
                const fromComponent = canvasComponents.find(c => c.id === connection.from);
                const toComponent = canvasComponents.find(c => c.id === connection.to);
                if (!fromComponent || !toComponent) return null;
                
                return (
                  <line
                    key={index}
                    x1={(fromComponent?.x ?? 0) + 90}
                    y1={(fromComponent?.y ?? 0) + 30}
                    x2={(toComponent?.x ?? 0) + 90}
                    y2={(toComponent?.y ?? 0) + 30}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                );
              })}
            </svg>

            {/* Canvas Components */}
            {canvasComponents.map((component) => (
              <div
                key={component.id}
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
                
                <div className="text-xs text-gray-700 bg-white/40 rounded-lg p-2">
                  {component.type === 'variable' && component.originalId === 'nested-mapping' 
                    ? `${component.properties?.visibility.name}: ${component.properties?.visibility.keyType1} → ${component.properties?.visibility.keyType2} → ${component.properties?.visibility.valueType}`
                    : component.type === 'variable' && component.originalId === 'mapping'
                    ? `${component.properties?.visibility.name}: ${component.properties?.visibility.keyType} → ${component.properties?.visibility.valueType}`
                    : component.type === 'function'
                    ? `${component.properties?.visibility.name}() ${component.properties?.visibility.visibility}${component.properties?.visibility.payable ? ' payable' : ''}${component.properties?.visibility.view ? ' view' : ''}`
                    : component.type === 'struct'
                    ? `struct ${component.properties?.visibility.name}`
                    : component.properties?.visibility.name || 'Click to configure'
                  }
                </div>

                {/* Component Status Indicators */}
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
                  
                  {selectedComponent?.id === component.id && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>
            ))}

            {/* Enhanced Empty State */}
            {canvasComponents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center max-w-2xl">
                  <div className="text-9xl mb-8 animate-bounce">🚀</div>
                  <div className="text-3xl font-bold mb-4 text-gray-600">Start Building Amazing Smart Contracts</div>
                  <div className="text-lg mb-8 text-gray-500">Drag components from the sidebar to create your blockchain masterpiece</div>
                  
                  <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl mx-auto">
                    <div className="font-semibold mb-4 text-gray-700">🎯 Quick Start Guide:</div>
                    <div className="text-left space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span>Add a <strong>Constructor</strong> to initialize your contract</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <span>Create <strong>State Variables</strong> to store data</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <span>Add <strong>Functions</strong> for contract logic</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <span>Include <strong>Security</strong> components for protection</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        <span>Click <strong>Generate Code</strong> to see your Solidity contract</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Properties Panel */}
          {selectedComponent && (
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
                    onClick={() => setSelectedComponent(null)}
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
                {Object.entries(selectedComponent.properties?.visibility).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/([0-9])/g, ' $1').trim()}
                    </label>
                    
                    {key === 'visibility' ? (
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
                    ) : key === 'dataType' ? (
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
                    ) : key === 'keyType' || key === 'valueType' || key === 'keyType1' || key === 'keyType2' ? (
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
                    ) : key === 'payable' || key === 'constant' || key === 'immutable' || key === 'view' || key === 'pure' || key === 'anonymous' || key === 'mintable' || key === 'burnable' || key === 'pausable' ? (
                      <label className="flex items-center space-x-3 cursor-pointer p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.checked)}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">
                          {key === 'payable' && 'Function can receive Ether'}
                          {key === 'constant' && 'Value cannot be changed'}
                          {key === 'immutable' && 'Set once in constructor'}
                          {key === 'view' && 'Read-only function'}
                          {key === 'pure' && 'No state access'}
                          {key === 'anonymous' && 'Anonymous event'}
                          {key === 'mintable' && 'Allow token minting'}
                          {key === 'burnable' && 'Allow token burning'}
                          {key === 'pausable' && 'Contract can be paused'}
                        </span>
                      </label>
                    ) : key === 'functionBody' || key === 'initCode' || key === 'fields' ? (
                      <textarea
                        value={String(value)}
                        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-mono text-sm"
                        rows={4}
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
                
                {/* Component-specific help and tips */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>💡 Best Practices:</strong>
                      <ul className="mt-2 space-y-1 text-xs">
                        {selectedComponent.type === 'function' && (
                          <>
                            <li>• Use 'external' for functions called by users</li>
                            <li>• Add proper access control modifiers</li>
                            <li>• Include input validation with require()</li>
                          </>
                        )}
                        {selectedComponent.type === 'variable' && (
                          <>
                            <li>• Use 'private' for internal data</li>
                            <li>• Consider gas costs for storage operations</li>
                            <li>• Use appropriate data types to save gas</li>
                          </>
                        )}
                        {selectedComponent.category === 'security' && (
                          <>
                            <li>• Always test security components thoroughly</li>
                            <li>• Follow established security patterns</li>
                            <li>• Consider professional security audits</li>
                          </>
                        )}
                        {selectedComponent.type === 'template' && (
                          <>
                            <li>• Templates provide battle-tested implementations</li>
                            <li>• Customize properties?.visibility to fit your needs</li>
                            <li>• Review generated code before deployment</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Gas Estimation */}
                {selectedComponent.gasEstimate && (
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-800">Gas Estimation</span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      Estimated gas cost: <span className="font-mono font-bold">{selectedComponent.gasEstimate.toLocaleString()}</span> gas
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Generated Code Panel */}
        {generatedCode && (
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
                
                {/* Security Issues */}
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
                {/* Gas Estimates */}
                {gasEstimates.deployment && (
                  <div className="text-sm text-gray-400 flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Deployment: ~{gasEstimates.deployment.toLocaleString()} gas</span>
                  </div>
                )}

                {/* Code Actions */}
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
                    onClick={() => setGeneratedCode('')}
                    className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Code Display */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              <pre className="whitespace-pre-wrap">{generatedCode}</pre>
            </div>

            {/* Security Issues Panel */}
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
        )}
      </div>
    </div>
  );
};

export default AdvancedSmartContractBuilder;