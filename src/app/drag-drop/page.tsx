'use client'
import React, { useState } from 'react';


import { componentLibrary,categories } from '@/constants/componentLibrary';
import { Database, Radio, Zap, Map, Cpu } from 'lucide-react';


const VisualSmartContractBuilder = () => {
  const [canvasComponents, setCanvasComponents] = useState<ComponentType[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [draggedComponent, setDraggedComponent] = useState<ComponentType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  interface ComponentType {
    originalId: string;
    y: string | number | undefined;
    x: string | number | undefined;
    id: string;
    type: string;
    name: string;
    icon: string | React.JSX.Element;
    color: string;
    properties: {
      [key: string]: any;
    };
  }


  // Generate unique ID
  const generateId = () => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle component drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, component: ComponentType) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e: { preventDefault: () => void; currentTarget: { getBoundingClientRect: () => any; }; clientX: number; clientY: number; }) => {
    e.preventDefault();
    if (!draggedComponent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent = {
      ...draggedComponent,
      id: generateId(),
      originalId: draggedComponent.id,
      x: Math.max(0, x - 75),
      y: Math.max(0, y - 25)
    };

    setCanvasComponents(prev => [...prev, newComponent]);
    setDraggedComponent(null);
  };

  // Handle canvas drag over
  const handleCanvasDragOver = (e: { preventDefault: () => void; dataTransfer: { dropEffect: string; }; }) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle component selection
  const handleComponentClick = (component: ComponentType) => {
    setSelectedComponent(component);
  };

  // Update component properties
  const updateComponentProperty = (componentId: any, property: string, value: string | boolean) => {
    setCanvasComponents(prev => 
      prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, properties: { ...comp.properties, [property]: value } }
          : comp
      )
    );
    
    // Update selected component if it's the one being modified
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          originalId: prev.originalId,
          y: prev.y,
          x: prev.x,
          id: prev.id,
          type: prev.type,
          name: prev.name,
          icon: prev.icon,
          color: prev.color,
          properties: { ...prev.properties, [property]: value }
        };
      });
    }
  };

  // Remove component from canvas
  const removeComponent = (componentId: string) => {
    setCanvasComponents(prev => prev.filter(comp => comp.id !== componentId));
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(null);
    }
  };

  // Generate Solidity code
  // Enhanced generateSolidityCode function with comprehensive component support
const generateSolidityCode = () => {
  let code = '';
  let imports = new Set<string>();
  let inheritance = new Set<string>();
  let interfaces = new Set<string>();
  
  // Analyze components to determine required imports and inheritance
  const templates = canvasComponents.filter(comp => comp.type === 'template');
  const hasAccessControl = canvasComponents.some(comp => comp.originalId === 'access-control');
  const hasReentrancyGuard = canvasComponents.some(comp => comp.originalId === 'reentrancy-guard');
  const hasUpgradeableProxy = canvasComponents.some(comp => comp.originalId === 'upgradeable-proxy');
  const hasERC20 = templates.some(t => t.originalId === 'erc20-advanced');
  const hasERC721 = templates.some(t => t.originalId === 'erc721');
  const hasDAO = templates.some(t => t.originalId === 'dao-voting');
  const hasOracle = canvasComponents.some(comp => comp.originalId === 'chainlink-price-feed');
  const hasFlashLoan = templates.some(t => t.originalId === 'flash-loan');
  
  // Add necessary imports
  if (hasERC20) {
    imports.add('@openzeppelin/contracts/token/ERC20/ERC20.sol');
    inheritance.add('ERC20');
  }
  
  if (hasERC721) {
    imports.add('@openzeppelin/contracts/token/ERC721/ERC721.sol');
    inheritance.add('ERC721');
  }
  
  if (hasAccessControl) {
    imports.add('@openzeppelin/contracts/access/Ownable.sol');
    inheritance.add('Ownable');
  }
  
  if (hasReentrancyGuard) {
    imports.add('@openzeppelin/contracts/security/ReentrancyGuard.sol');
    inheritance.add('ReentrancyGuard');
  }
  
  if (hasUpgradeableProxy) {
    imports.add('@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol');
    imports.add('@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol');
    inheritance.add('Initializable');
    inheritance.add('UUPSUpgradeable');
  }
  
  if (hasDAO) {
    imports.add('@openzeppelin/contracts/governance/Governor.sol');
    imports.add('@openzeppelin/contracts/governance/extensions/GovernorSettings.sol');
    imports.add('@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol');
    imports.add('@openzeppelin/contracts/governance/extensions/GovernorVotes.sol');
    inheritance.add('Governor');
    inheritance.add('GovernorSettings');
    inheritance.add('GovernorCountingSimple');
    inheritance.add('GovernorVotes');
  }
  
  if (hasOracle) {
    imports.add('@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol');
    interfaces.add('AggregatorV3Interface');
  }
  
  if (hasFlashLoan) {
    imports.add('@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol');
    imports.add('@aave/core-v3/contracts/interfaces/IPool.sol');
    imports.add('@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanReceiver.sol');
    interfaces.add('IFlashLoanReceiver');
  }
  
  // Start building the contract
  code += `// SPDX-License-Identifier: MIT\n`;
  code += `pragma solidity ^0.8.19;\n\n`;
  
  // Add imports
  Array.from(imports).forEach(importPath => {
    code += `import "${importPath}";\n`;
  });
  
  if (imports.size > 0) code += '\n';
  
  // Add interfaces
  Array.from(interfaces).forEach(interfaceName => {
    if (interfaceName === 'IFlashLoanReceiver') {
      code += `interface ${interfaceName} {\n`;
      code += `    function executeOperation(\n`;
      code += `        address[] calldata assets,\n`;
      code += `        uint256[] calldata amounts,\n`;
      code += `        uint256[] calldata premiums,\n`;
      code += `        address initiator,\n`;
      code += `        bytes calldata params\n`;
      code += `    ) external returns (bool);\n`;
      code += `}\n\n`;
    }
  });
  
  // Contract declaration with inheritance
  const inheritanceList = Array.from(inheritance);
  const contractName = 'GeneratedContract';
  
  if (inheritanceList.length > 0) {
    code += `contract ${contractName} is ${inheritanceList.join(', ')} {\n`;
  } else {
    code += `contract ${contractName} {\n`;
  }
  
  // Add custom errors (modern Solidity practice)
  code += `    // Custom Errors\n`;
  code += `    error Unauthorized();\n`;
  code += `    error InsufficientBalance();\n`;
  code += `    error InvalidInput();\n`;
  code += `    error TransferFailed();\n\n`;
  
  // Add structs
  const structs = canvasComponents.filter(comp => comp.type === 'struct');
  if (structs.length > 0) {
    code += `    // Structs\n`;
    structs.forEach(struct => {
      code += `    struct ${struct.properties.name} {\n`;
      const fields = struct.properties.fields.split(';').filter((field: string) => field.trim());
      fields.forEach((field: string) => {
        code += `        ${field.trim()};\n`;
      });
      code += `    }\n\n`;
    });
  }
  
  // Add state variables
  const variables = canvasComponents.filter(comp => comp.type === 'variable');
  if (variables.length > 0) {
    code += `    // State Variables\n`;
    variables.forEach(variable => {
      if (variable.originalId === 'mapping') {
        code += `    mapping(${variable.properties.keyType} => ${variable.properties.valueType}) ${variable.properties.visibility} ${variable.properties.name};\n`;
      } else if (variable.originalId === 'nested-mapping') {
        code += `    mapping(${variable.properties.keyType1} => mapping(${variable.properties.keyType2} => ${variable.properties.valueType})) ${variable.properties.visibility} ${variable.properties.name};\n`;
      } else if (variable.originalId === 'diamond-storage') {
        code += `    // Diamond Storage Pattern\n`;
        code += `    bytes32 constant ${variable.properties.namespace.toUpperCase()}_STORAGE_POSITION = ${variable.properties.storageSlot};\n`;
        code += `    \n`;
        code += `    struct ${variable.properties.namespace}Storage {\n`;
        const storageVars = variable.properties.variables.split(';').filter((v: string) => v.trim());
        storageVars.forEach((v: string) => {
          code += `        ${v.trim()};\n`;
        });
        code += `    }\n\n`;
        code += `    function ${variable.properties.namespace.toLowerCase()}Storage() internal pure returns (${variable.properties.namespace}Storage storage ds) {\n`;
        code += `        bytes32 position = ${variable.properties.namespace.toUpperCase()}_STORAGE_POSITION;\n`;
        code += `        assembly {\n`;
        code += `            ds.slot := position\n`;
        code += `        }\n`;
        code += `    }\n\n`;
      } else {
        const constant = variable.properties.constant ? ' constant' : '';
        const immutable = variable.properties.immutable ? ' immutable' : '';
        const defaultValue = variable.properties.defaultValue ? ` = ${variable.properties.defaultValue}` : '';
        code += `    ${variable.properties.dataType} ${variable.properties.visibility}${constant}${immutable} ${variable.properties.name}${defaultValue};\n`;
      }
    });
    code += '\n';
  }
  
  // Add events
  const events = canvasComponents.filter(comp => comp.type === 'event');
  if (events.length > 0) {
    code += `    // Events\n`;
    events.forEach(event => {
      const anonymous = event.properties.anonymous ? ' anonymous' : '';
      code += `    event ${event.properties.name}(${event.properties.parameters})${anonymous};\n`;
    });
    code += '\n';
  }
  
  // Add modifiers
  const modifiers = canvasComponents.filter(comp => comp.type === 'modifier');
  if (modifiers.length > 0) {
    code += `    // Modifiers\n`;
    modifiers.forEach(modifier => {
      code += `    modifier ${modifier.properties.name}(${modifier.properties.parameters || ''}) {\n`;
      
      if (modifier.originalId === 'access-control') {
        code += `        if (${modifier.properties.condition}) revert Unauthorized();\n`;
      } else if (modifier.originalId === 'reentrancy-guard') {
        code += `        if (${modifier.properties.status} == ${modifier.properties.entered}) revert ReentrancyGuard__ReentrantCall();\n`;
        code += `        ${modifier.properties.status} = ${modifier.properties.entered};\n`;
        code += `        _;\n`;
        code += `        ${modifier.properties.status} = ${modifier.properties.notEntered};\n`;
      } else if (modifier.originalId === 'time-lock') {
        code += `        if (!(${modifier.properties.timeCondition})) revert InvalidInput();\n`;
      } else if (modifier.originalId === 'multi-sig') {
        code += `        if (!_verifyMultipleSignatures(${modifier.properties.proposalId}, ${modifier.properties.signers})) revert Unauthorized();\n`;
      } else {
        code += `        if (!(${modifier.properties.condition})) revert Unauthorized();\n`;
      }
      
      if (modifier.originalId !== 'reentrancy-guard') {
        code += `        _;\n`;
      }
      code += `    }\n\n`;
    });
  }
  
  // Add constructor
  const constructor = canvasComponents.find(comp => comp.originalId === 'constructor');
  if (constructor || hasERC20 || hasERC721 || hasDAO) {
    code += `    // Constructor\n`;
    const constructorParams = constructor?.properties.parameters || '';
    const payable = constructor?.properties.payable ? ' payable' : '';
    
    // Build constructor parameters from templates
    let allConstructorParams = [];
    if (constructorParams) allConstructorParams.push(constructorParams);
    
    if (hasERC20) {
      const token = templates.find(t => t.originalId === 'erc20-advanced');
      if (!constructorParams.includes('string')) {
        allConstructorParams.push('string memory name', 'string memory symbol');
      }
    }
    
    if (hasERC721) {
      const nft = templates.find(t => t.originalId === 'erc721');
      if (!constructorParams.includes('string')) {
        allConstructorParams.push('string memory name', 'string memory symbol');
      }
    }
    
    const finalParams = allConstructorParams.join(', ');
    code += `    constructor(${finalParams})${payable}`;
    
    // Add parent constructor calls
    const parentCalls = [];
    if (hasERC20) {
      const token = templates.find(t => t.originalId === 'erc20-advanced');
      parentCalls.push(`ERC20("${token?.properties.name || 'name'}", "${token?.properties.symbol || 'symbol'}")`);
    }
    if (hasERC721) {
      const nft = templates.find(t => t.originalId === 'erc721');
      parentCalls.push(`ERC721("${nft?.properties.name || 'name'}", "${nft?.properties.symbol || 'symbol'}")`);
    }
    if (hasDAO) {
      const dao = templates.find(t => t.originalId === 'dao-voting');
      parentCalls.push(`Governor("${dao?.properties.name || 'DAO'}")`);
      parentCalls.push(`GovernorSettings(${dao?.properties.votingDelay || '1'}, ${dao?.properties.votingPeriod || '50400'}, ${dao?.properties.proposalThreshold || '0'})`);
    }
    
    if (parentCalls.length > 0) {
      code += ` ${parentCalls.join(' ')}`; 
    }
    
    code += ` {\n`;
    
    // Add initialization code
    if (hasERC20) {
      const token = templates.find(t => t.originalId === 'erc20-advanced');
      if (token?.properties.mintable) {
        code += `        _mint(msg.sender, ${token.properties.supply} * 10**decimals());\n`;
      }
    }
    
    if (constructor?.properties.initCode) {
      code += `        ${constructor.properties.initCode}\n`;
    }
    
    code += `    }\n\n`;
  }
  
  // Add template-specific implementations
  templates.forEach(template => {
    if (template.originalId === 'liquidity-pool') {
      code += `    // Liquidity Pool Implementation\n`;
      code += `    uint256 public constant MINIMUM_LIQUIDITY = ${template.properties.minLiquidity};\n`;
      code += `    uint256 public constant FEE_DENOMINATOR = 1000;\n`;
      code += `    uint256 public constant FEE_NUMERATOR = ${Math.floor(template.properties.fee * 10)};\n`;
      code += `    \n`;
      code += `    function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidity) {\n`;
      code += `        // Add liquidity logic here\n`;
      code += `        emit LiquidityAdded(msg.sender, amountA, amountB, liquidity);\n`;
      code += `    }\n\n`;
      
    } else if (template.originalId === 'flash-loan') {
      code += `    // Flash Loan Implementation\n`;
      code += `    IPool public immutable POOL;\n`;
      code += `    uint256 public constant FLASH_LOAN_FEE = ${Math.floor((template.properties.flashLoanFee || 0.09) * 10000)}; // basis points\n`;
      code += `    \n`;
      code += `    function executeFlashLoan(address asset, uint256 amount) external {\n`;
      code += `        address[] memory assets = new address[](1);\n`;
      code += `        assets[0] = asset;\n`;
      code += `        uint256[] memory amounts = new uint256[](1);\n`;
      code += `        amounts[0] = amount;\n`;
      code += `        uint256[] memory modes = new uint256[](1);\n`;
      code += `        modes[0] = 0;\n`;
      code += `        POOL.flashLoan(address(this), assets, amounts, modes, address(this), "", 0);\n`;
      code += `    }\n\n`;
      
    } else if (template.originalId === 'dao-voting') {
      code += `    // DAO Voting Implementation\n`;
      code += `    function votingDelay() public pure override returns (uint256) {\n`;
      code += `        return ${template.properties.votingDelay || '1 days'};\n`;
      code += `    }\n\n`;
      code += `    function votingPeriod() public pure override returns (uint256) {\n`;
      code += `        return ${template.properties.votingPeriod || '1 weeks'};\n`;
      code += `    }\n\n`;
      code += `    function quorum(uint256 blockNumber) public pure override returns (uint256) {\n`;
      code += `        return ${template.properties.quorum || '4e16'}; // 4%\n`;
      code += `    }\n\n`;
      
    } else if (template.originalId === 'bridge-connector') {
      code += `    // Bridge Connector Implementation\n`;
      code += `    address public constant BRIDGE_ADDRESS = ${template.properties.bridgeAddress || 'address(0)'};\n`;
      code += `    uint256 public constant LOCK_PERIOD = ${template.properties.lockPeriod || '1 hours'};\n`;
      code += `    uint256 public constant MIN_AMOUNT = ${template.properties.minAmount || '0.1 ether'};\n`;
      code += `    uint256 public constant MAX_AMOUNT = ${template.properties.maxAmount || '100 ether'};\n`;
      code += `    \n`;
      code += `    function bridgeToChain(uint256 amount, uint256 destinationChain) external {\n`;
      code += `        if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) revert InvalidInput();\n`;
      code += `        // Bridge logic here\n`;
      code += `        emit BridgeInitiated(msg.sender, amount, destinationChain);\n`;
      code += `    }\n\n`;
    }
  });
  
  // Add Oracle integration
  const oracles = canvasComponents.filter(comp => comp.originalId === 'chainlink-price-feed');
  oracles.forEach(oracle => {
    code += `    // Price Feed Oracle\n`;
    code += `    AggregatorV3Interface internal ${oracle.properties.pair.replace('/', '_').toLowerCase()}PriceFeed;\n`;
    code += `    \n`;
    code += `    function getLatest${oracle.properties.pair.replace('/', '')}Price() public view returns (int) {\n`;
    code += `        (, int price, , , ) = ${oracle.properties.pair.replace('/', '_').toLowerCase()}PriceFeed.latestRoundData();\n`;
    code += `        return price;\n`;
    code += `    }\n\n`;
  });
  
  // Add functions
  const functions = canvasComponents.filter(comp => 
    comp.type === 'function' && 
    !['constructor'].includes(comp.originalId)
  );
  
  if (functions.length > 0) {
    code += `    // Functions\n`;
    functions.forEach(func => {
      const payableKeyword = func.properties.payable ? ' payable' : '';
      const viewKeyword = func.properties.view ? ' view' : '';
      const pureKeyword = func.properties.pure ? ' pure' : '';
      const returnsKeyword = func.properties.returns ? ` returns (${func.properties.returns})` : '';
      const modifiersList = func.properties.modifiers ? ` ${func.properties.modifiers}` : '';
      
      code += `    function ${func.properties.name}(${func.properties.parameters || ''}) ${
        func.properties.visibility
      }${viewKeyword}${pureKeyword}${payableKeyword}${returnsKeyword}${modifiersList} {\n`;

      if (func.originalId === 'payable-function') {
        code += `        if (msg.value < ${func.properties.minAmount}) revert InsufficientBalance();\n`;
        code += `        emit PaymentReceived(msg.sender, msg.value);\n`;
      } else if (func.originalId === 'batch-transfer') {
        code += `        if (${func.properties.arrayType}.length != ${func.properties.valueType}.length) revert InvalidInput();\n`;
        code += `        if (${func.properties.arrayType}.length > ${func.properties.maxBatchSize}) revert InvalidInput();\n`;
        code += `        \n`;
        code += `        for (uint256 i = 0; i < ${func.properties.arrayType}.length; i++) {\n`;
        code += `            // Batch transfer logic\n`;
        code += `            if (${func.properties.checkSuccess}) {\n`;
        code += `                // Add success verification\n`;
        code += `            }\n`;
        code += `        }\n`;
      } else if (func.originalId === 'view-function') {
        code += `        ${func.properties.functionBody || 'return 0;'}\n`;
      }

      if (func.properties.functionBody && func.originalId !== 'view-function') {
        code += `        ${func.properties.functionBody}\n`;
      } else if (!func.properties.functionBody && func.originalId === 'payable-function') {
        // Already handled above
      } else if (!func.properties.functionBody && func.originalId !== 'view-function') {
        code += `        // TODO: Implement function logic\n`;
      }
      
      code += `    }\n\n`;
    });
  }
  
  // Add multi-sig helper functions if needed
  if (canvasComponents.some(comp => comp.originalId === 'multi-sig')) {
    code += `    // Multi-signature Helper Functions\n`;
    code += `    function _verifyMultipleSignatures(bytes32 proposalId, address[] memory signers) internal view returns (bool) {\n`;
    code += `        // Implement signature verification logic\n`;
    code += `        return signers.length >= 2; // Placeholder\n`;
    code += `    }\n\n`;
  }
  
  // Add proxy upgrade functions if needed
  if (hasUpgradeableProxy) {
    code += `    // Proxy Upgrade Functions\n`;
    code += `    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}\n\n`;
    code += `    function initialize() public initializer {\n`;
    code += `        __Ownable_init();\n`;
    code += `        __UUPSUpgradeable_init();\n`;
    code += `    }\n\n`;
  }
  
  // Add fallback and receive functions if needed
  const hasPayable = canvasComponents.some(comp => comp.properties.payable);
  if (hasPayable) {
    code += `    // Ether handling\n`;
    code += `    receive() external payable {\n`;
    code += `        emit PaymentReceived(msg.sender, msg.value);\n`;
    code += `    }\n\n`;
    code += `    fallback() external payable {\n`;
    code += `        emit PaymentReceived(msg.sender, msg.value);\n`;
    code += `    }\n\n`;
  }
  
  code += `}`;
  
  setGeneratedCode(code);
};

  // Filter components by selected category
  const filteredComponents = componentLibrary.filter(component => 
    selectedCategory === 'all' || component.category === selectedCategory
  );

  const parseSolidityContract = (solidityCode: string) => {
    try {
      // Clear existing components
      setCanvasComponents([]);
      
      const lines = solidityCode.split('\n');
      let currentY = 50;
      const spacing = 150;
      
      // Regular expressions for matching different Solidity elements
      const patterns = {
        stateVariable: /^\s*(.*?)\s+(public|private|internal|external)?\s+(\w+)\s*(?:=\s*([^;]+))?;/,
        function: /^\s*function\s+(\w+)\s*\((.*?)\)(?:\s+(public|private|internal|external))?\s*(?:(pure|view|payable))?\s*(?:returns\s*\((.*?)\))?\s*{/,
        event: /^\s*event\s+(\w+)\s*\((.*?)\);/,
        mapping: /^\s*mapping\s*\((\w+)\s*=>\s*(\w+)\)\s*(public|private|internal|external)?\s+(\w+);/,
        modifier: /^\s*modifier\s+(\w+)\s*\((.*?)\)\s*{/,
        constructor: /^\s*constructor\s*\((.*?)\)\s*{/
      };

      lines.forEach((line, index) => {
        let match;
        let component: ComponentType | null = null;

        // Check for state variables
        if ((match = line.match(patterns.stateVariable))) {
          component = {
            id: generateId(),
            originalId: 'state-variable',
            type: 'variable',
            name: 'State Variable',
            icon: <Database className="w-5 h-5" />,
            color: 'bg-green-100 border-green-300',
            x: 50,
            y: currentY,
            properties: {
              dataType: match[1].trim(),
              visibility: match[2] || 'internal',
              name: match[3],
              defaultValue: match[4] || ''
            }
          };
        }
        // Check for functions
        else if ((match = line.match(patterns.function))) {
          component = {
            id: generateId(),
            originalId: 'function',
            type: 'function',
            name: 'Function',
            icon: <Zap className="w-5 h-5" />,
            color: 'bg-purple-100 border-purple-300',
            x: 50,
            y: currentY,
            properties: {
              name: match[1],
              parameters: match[2],
              visibility: match[3] || 'public',
              modifiers: match[4] || '',
              returns: match[5] || ''
            }
          };
        }
        // Check for events
        else if ((match = line.match(patterns.event))) {
          component = {
            id: generateId(),
            originalId: 'event',
            type: 'event',
            name: 'Event',
            icon: <Radio className="w-5 h-5" />,
            color: 'bg-yellow-100 border-yellow-300',
            x: 50,
            y: currentY,
            properties: {
              name: match[1],
              parameters: match[2]
            }
          };
        }
        // Check for mappings
        else if ((match = line.match(patterns.mapping))) {
          component = {
            id: generateId(),
            originalId: 'mapping',
            type: 'variable',
            name: 'Mapping',
            icon: <Map className="w-5 h-5" />,
            color: 'bg-indigo-100 border-indigo-300',
            x: 50,
            y: currentY,
            properties: {
              keyType: match[1],
              valueType: match[2],
              visibility: match[3] || 'internal',
              name: match[4]
            }
          };
        }
        // Check for constructor
        else if ((match = line.match(patterns.constructor))) {
          component = {
            id: generateId(),
            originalId: 'constructor',
            type: 'function',
            name: 'Constructor',
            icon: <Cpu className="w-5 h-5" />,
            color: 'bg-blue-100 border-blue-300',
            x: 50,
            y: currentY,
            properties: {
              parameters: match[1],
              visibility: 'public'
            }
          };
        }

        if (component) {
          setCanvasComponents(prev => [...prev, component as ComponentType]);
          currentY += spacing;
        }
      });
    } catch (error) {
      console.error('Error parsing Solidity contract:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Component Library Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-lg font-bold">Smart Contract Components</h2>
          <p className="text-sm opacity-90">Drag to canvas</p>
        </div>
        
        {/* Category filter */}
        <div className="p-2 border-b">
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Component list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              draggable
              onDragStart={(e) => handleDragStart(e, { 
                ...component, 
                originalId: component.id, 
                x: undefined, 
                y: undefined 
              })}
              className={`p-3 rounded-lg border-2 cursor-move hover:shadow-md transition-all transform hover:scale-105 ${component.color}`}
            >
              <div className="flex items-center space-x-3">
                {component.icon}
                <div>
                  <div className="font-semibold text-sm">{component.name}</div>
                  <div className="text-xs text-gray-600">{component.description}</div>
                  <div className="text-xs text-gray-500">Gas: ~{component.gasEstimate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Visual Smart Contract Builder</h1>
            <p className="text-sm text-gray-600">Build smart contracts visually without code</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateSolidityCode}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Generate Code
            </button>
            <button
              onClick={() => {
                setCanvasComponents([]);
                setSelectedComponent(null);
                setGeneratedCode('');
              }}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Import Contract
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Canvas */}
          <div
            className="flex-1 relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden"
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            style={{ minHeight: '600px' }}
          >
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            {/* Canvas Components */}
            {canvasComponents.map((component) => (
              <div
                key={component.id}
                onClick={() => handleComponentClick(component)}
                className={`absolute p-4 rounded-lg shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl transform hover:scale-105 ${
                  selectedComponent?.id === component.id ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                } ${component.color}`}
                style={{ 
                  left: component.x, 
                  top: component.y,
                  minWidth: '180px',
                  zIndex: selectedComponent?.id === component.id ? 10 : 1
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{component.icon}</span>
                    <div>
                      <div className="font-semibold text-sm">{component.name}</div>
                      <div className="text-xs text-gray-600 capitalize">{component.type}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(component.id);
                    }}
                    className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-gray-700">
                  {component.type === 'variable' && component.originalId === 'mapping' 
                    ? `${component.properties.name}: ${component.properties.keyType} → ${component.properties.valueType}`
                    : component.type === 'function'
                    ? `${component.properties.name}() ${component.properties.visibility}`
                    : component.properties.name || 'Click to configure'
                  }
                </div>
              </div>
            ))}

            {/* Empty state */}
            {canvasComponents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-8xl mb-6">🎯</div>
                  <div className="text-2xl font-semibold mb-2">Start Building</div>
                  <div className="text-lg">Drag components from the sidebar to create your smart contract</div>
                  <div className="text-sm mt-4 bg-white p-4 rounded-lg shadow-md max-w-md">
                    <div className="font-medium mb-2">Quick Start:</div>
                    <div className="text-left space-y-1">
                      <div>1. Drag a <strong>Constructor</strong> to initialize your contract</div>
                      <div>2. Add <strong>State Variables</strong> to store data</div>
                      <div>3. Create <strong>Functions</strong> for contract logic</div>
                      <div>4. Click <strong>Generate Code</strong> to see Solidity</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Properties Panel */}
          {selectedComponent && (
            <div className="w-80 bg-white border-l shadow-lg flex flex-col">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center space-x-2">
                    <span>{selectedComponent.icon}</span>
                    <span>{selectedComponent.name}</span>
                  </h3>
                  <button
                    onClick={() => setSelectedComponent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-1 capitalize">{selectedComponent.type}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(selectedComponent.properties).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {key === 'visibility' ? (
                      <select
                        value={value}
                        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                      </select>
                    ) : key === 'dataType' ? (
                      <select
                        value={value}
                        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    ) : key === 'keyType' || key === 'valueType' ? (
                      <select
                        value={value}
                        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="address">address</option>
                        <option value="uint256">uint256</option>
                        <option value="string">string</option>
                        <option value="bytes32">bytes32</option>
                        <option value="bool">bool</option>
                      </select>
                    ) : key === 'payable' ? (
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">Function can receive Ether</span>
                      </label>
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateComponentProperty(selectedComponent.id, key, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder={`Enter ${key}`}
                      />
                    )}
                  </div>
                ))}
                
                {/* Component-specific help text */}
                <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong>
                    {selectedComponent.type === 'function' && " Functions define the behavior of your contract. Make them external if called by users."}
                    {selectedComponent.type === 'variable' && " State variables store data permanently on the blockchain."}
                    {selectedComponent.type === 'event' && " Events let external applications listen to contract activities."}
                    {selectedComponent.type === 'modifier' && " Modifiers add access control and validation to functions."}
                    {selectedComponent.type === 'template' && " Templates provide pre-built contract functionality."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Code Panel */}
        {generatedCode && (
          <div className="h-80 bg-gray-900 text-green-400 border-t flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div>
                <h3 className="font-bold text-white">Generated Solidity Code</h3>
                <p className="text-sm text-gray-400">Ready to deploy smart contract</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  📋 Copy Code
                </button>
                <button
                  onClick={() => setGeneratedCode('')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium"
                >
                  Hide
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">{generatedCode}</pre>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[600px]">
              <h3 className="text-xl font-bold mb-4">Import Solidity Contract</h3>
              <div className="space-y-4">
                <textarea
                  className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                  placeholder="Paste your Solidity contract code here..."
                  onChange={(e) => parseSolidityContract(e.target.value)}
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualSmartContractBuilder;