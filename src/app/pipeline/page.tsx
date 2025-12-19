'use client'
import React, { useState, useCallback, useRef } from 'react';
import { Play, Plus, Settings, Upload, CheckCircle, XCircle, Clock, GitBranch, Zap, AlertTriangle, FileText, Shield } from 'lucide-react';
import { Node, NodeConfig, Connection, ExecutionLog, Template, NodeType } from '@/types/pipeline';

// Pipeline Node Types for Solidity/EVM
const nodeTypes: Record<string, NodeType> = {
  import: { icon: Upload, color: 'bg-blue-500', label: 'Import Contract' },
  compile: { icon: Zap, color: 'bg-yellow-500', label: 'Solidity Compile' },
  test: { icon: CheckCircle, color: 'bg-green-500', label: 'Run Tests' },
  deploy: { icon: GitBranch, color: 'bg-purple-500', label: 'Deploy EVM' },
  verify: { icon: Shield, color: 'bg-emerald-500', label: 'Verify Contract' },
  condition: { icon: AlertTriangle, color: 'bg-orange-500', label: 'Condition' },
  wait: { icon: Clock, color: 'bg-gray-500', label: 'Wait/Approval' },
  gasOptimize: { icon: Zap, color: 'bg-indigo-500', label: 'Gas Optimize' }
};

const PipelineBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionStatus, setExecutionStatus] = useState<Record<string, string>>({});
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Predefined templates for Solidity
  const templates: Record<string, Template> = {
    basic: {
      name: "Basic ERC20 Deploy",
      nodes: [
        { id: '1', type: 'import', x: 50, y: 100, config: { contractFile: 'MyToken.sol', contractType: 'ERC20' } },
        { id: '2', type: 'compile', x: 280, y: 100, config: { solcVersion: '0.8.19', optimizer: true } },
        { id: '3', type: 'deploy', x: 510, y: 100, config: { network: 'asset-hub-testnet', gasLimit: '2000000' } }
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' }
      ]
    },
    production: {
      name: "Production Pipeline",
      nodes: [
        { id: '1', type: 'import', x: 50, y: 100, config: { contractFile: 'MyContract.sol', contractType: 'Custom' } },
        { id: '2', type: 'compile', x: 200, y: 100, config: { solcVersion: '0.8.19', optimizer: true } },
        { id: '3', type: 'gasOptimize', x: 350, y: 100, config: { runs: 200 } },
        { id: '4', type: 'test', x: 500, y: 100, config: { testSuite: 'foundry' } },
        { id: '5', type: 'deploy', x: 650, y: 50, config: { network: 'asset-hub-testnet' } },
        { id: '6', type: 'verify', x: 800, y: 50, config: { explorer: 'polkadot-js' } },
        { id: '7', type: 'condition', x: 650, y: 200, config: { condition: 'testnet_success' } },
        { id: '8', type: 'deploy', x: 800, y: 200, config: { network: 'asset-hub-mainnet' } }
      ],
      connections: [
        { from: '1', to: '2' },
        { from: '2', to: '3' },
        { from: '3', to: '4' },
        { from: '4', to: '5' },
        { from: '5', to: '6' },
        { from: '4', to: '7' },
        { from: '7', to: '8' }
      ]
    },
    multiContract: {
      name: "Multi-Contract DeFi",
      nodes: [
        { id: '1', type: 'import', x: 50, y: 50, config: { contractFile: 'Token.sol', contractType: 'ERC20' } },
        { id: '2', type: 'import', x: 50, y: 150, config: { contractFile: 'Pool.sol', contractType: 'DEX' } },
        { id: '3', type: 'compile', x: 250, y: 100, config: { solcVersion: '0.8.19' } },
        { id: '4', type: 'test', x: 400, y: 100, config: { testSuite: 'integration' } },
        { id: '5', type: 'deploy', x: 550, y: 50, config: { network: 'asset-hub-testnet', contract: 'Token' } },
        { id: '6', type: 'deploy', x: 550, y: 150, config: { network: 'asset-hub-testnet', contract: 'Pool' } }
      ],
      connections: [
        { from: '1', to: '3' },
        { from: '2', to: '3' },
        { from: '3', to: '4' },
        { from: '4', to: '5' },
        { from: '4', to: '6' }
      ]
    }
  };

  const addNode = useCallback((type: string, x?: number, y?: number) => {
    const newNode: Node = {
      id: Date.now().toString(),
      type,
      x: x || 100,
      y: y || 100,
      config: getDefaultConfig(type)
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const getDefaultConfig = (type: string): NodeConfig => {
    switch (type) {
      case 'import':
        return { 
          contractFile: 'Contract.sol', 
          contractType: 'Custom',
          dependencies: ['@openzeppelin/contracts']
        };
      case 'compile':
        return { 
          solcVersion: '0.8.19', 
          optimizer: true, 
          optimizerRuns: 200,
          evmVersion: 'london'
        };
      case 'gasOptimize':
        return { runs: 200, viaIR: false };
      case 'test':
        return { 
          testSuite: 'foundry', 
          coverage: true,
          gasReport: true
        };
      case 'deploy':
        return { 
          network: 'asset-hub-testnet', 
          gasLimit: '2000000',
          gasPrice: 'auto',
          confirmations: 1,
          contract: ''
        };
      case 'verify':
        return { 
          explorer: 'polkadot-js', 
          apiKey: '',
          constructorArgs: []
        };
      case 'condition':
        return { 
          condition: 'always', 
          waitFor: '',
          retryCount: 3
        };
      case 'wait':
        return { 
          duration: '5', 
          unit: 'minutes', 
          approvalRequired: false
        };
      default:
        return {};
    }
  };

  const loadTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    setNodes(template.nodes);
    setConnections(template.connections);
    setExecutionStatus({});
    setExecutionLogs([]);
  };

  const addLog = (message: string, type: ExecutionLog['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const executePipeline = async () => {
    setIsExecuting(true);
    setExecutionStatus({});
    setExecutionLogs([]);
    
    addLog('Starting pipeline execution...', 'info');
    
    // Sort nodes based on dependencies
    const sortedNodes = [...nodes].sort((a, b) => {
      const aConnections = connections.filter(c => c.to === a.id).length;
      const bConnections = connections.filter(c => c.to === b.id).length;
      return aConnections - bConnections;
    });

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i];
      const nodeLabel = nodeTypes[node.type]?.label || node.type;
      
      setExecutionStatus(prev => ({ ...prev, [node.id]: 'running' }));
      addLog(`Executing: ${nodeLabel}`, 'info');
      
      // Simulate execution time based on node type
      const executionTime = getExecutionTime(node.type);
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // Simulate node-specific execution
      const success = await simulateNodeExecution(node, addLog);
      
      if (success) {
        setExecutionStatus(prev => ({ ...prev, [node.id]: 'success' }));
        addLog(`✅ ${nodeLabel} completed successfully`, 'success');
      } else {
        setExecutionStatus(prev => ({ ...prev, [node.id]: 'failed' }));
        addLog(`❌ ${nodeLabel} failed`, 'error');
        break;
      }
    }
    
    addLog('Pipeline execution completed', 'info');
    setIsExecuting(false);
  };

  const getExecutionTime = (nodeType: string) => {
    const times: Record<string, number> = {
      import: 1000,
      compile: 3000,
      gasOptimize: 2000,
      test: 4000,
      deploy: 5000,
      verify: 3000,
      condition: 500,
      wait: 1000
    };
    return times[nodeType] || 2000;
  };

  const simulateNodeExecution = async (node: Node, logger: (msg: string, type?: ExecutionLog['type']) => void) => {
    switch (node.type) {
      case 'import':
        logger(`📁 Importing ${node.config.contractFile}`, 'info');
        logger(`📦 Installing dependencies: ${node.config.dependencies?.join(', ') || 'none'}`, 'info');
        return true;
        
      case 'compile':
        logger(`🔧 Compiling with Solc ${node.config.solcVersion}`, 'info');
        logger(`⚡ Optimizer: ${node.config.optimizer ? 'enabled' : 'disabled'}`, 'info');
        return true;
        
      case 'gasOptimize':
        logger(`⛽ Optimizing gas usage (${node.config.runs} runs)`, 'info');
        logger(`📊 Gas savings: ~15%`, 'success');
        return true;
        
      case 'test':
        logger(`🧪 Running ${node.config.testSuite} tests`, 'info');
        logger(`✅ All tests passed (12/12)`, 'success');
        if (node.config.coverage) logger(`📈 Coverage: 95%`, 'info');
        return true;
        
      case 'deploy':
        if (node.config.network === 'asset-hub-mainnet') {
          logger(`🚀 Deploying to Asset Hub Mainnet`, 'info');
          // Show demo dialog for mainnet
          setTimeout(() => {
            alert('🎉 Contract successfully deployed to Asset Hub Mainnet!\n\nContract Address: 0x1234...5678 (demo)\nTransaction Hash: 0xabcd...ef01 (demo)');
          }, 1000);
        } else {
          logger(`🚀 Deploying to ${node.config.network}`, 'info');
          logger(`📍 Contract deployed at: 0x${Math.random().toString(16).substr(2, 8)}...`, 'success');
        }
        return true;
        
      case 'verify':
        logger(`🔍 Verifying contract on ${node.config.explorer}`, 'info');
        logger(`✅ Contract verified successfully`, 'success');
        return true;
        
      case 'condition':
        logger(`🔀 Evaluating condition: ${node.config.condition}`, 'info');
        return true;
        
      default:
        return true;
    }
  };

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    setDraggedNode(nodeType);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addNode(draggedNode, x, y);
      setDraggedNode(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStatusIcon = (nodeId: string) => {
    const status = executionStatus[nodeId];
    if (status === 'running') return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  interface SolidityNodeConfigProps {
    node: Node | undefined;
    onUpdate: (config: Partial<NodeConfig>) => void;
  }
  
  const SolidityNodeConfig: React.FC<SolidityNodeConfigProps> = ({ node, onUpdate }) => {
    if (!node) return null;

    const handleInputChange = (key: string, value: any) => {
      onUpdate({ [key]: value });
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Type
          </label>
          <input
            type="text"
            value={nodeTypes[node.type]?.label || node.type}
            disabled
            className="w-full p-2 border border-gray-300 rounded bg-gray-50"
          />
        </div>

        {node.type === 'import' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract File
              </label>
              <input
                type="text"
                value={node.config.contractFile || ''}
                onChange={(e) => handleInputChange('contractFile', e.target.value)}
                placeholder="MyContract.sol"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type
              </label>
              <select
                value={node.config.contractType || 'Custom'}
                onChange={(e) => handleInputChange('contractType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="ERC20">ERC20 Token</option>
                <option value="ERC721">ERC721 NFT</option>
                <option value="ERC1155">ERC1155 Multi-Token</option>
                <option value="DEX">DEX/AMM</option>
                <option value="Governance">Governance/DAO</option>
                <option value="Custom">Custom Contract</option>
              </select>
            </div>
          </>
        )}

        {node.type === 'compile' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solc Version
              </label>
              <select
                value={node.config.solcVersion || '0.8.19'}
                onChange={(e) => handleInputChange('solcVersion', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="0.8.19">0.8.19 (Latest)</option>
                <option value="0.8.18">0.8.18</option>
                <option value="0.8.17">0.8.17</option>
                <option value="0.8.0">0.8.0</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={node.config.optimizer || false}
                onChange={(e) => handleInputChange('optimizer', e.target.checked)}
                className="rounded"
              />
              <label className="text-sm text-gray-700">Enable Optimizer</label>
            </div>
            {node.config.optimizer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Optimizer Runs
                </label>
                <input
                  type="number"
                  value={node.config.optimizerRuns || 200}
                  onChange={(e) => handleInputChange('optimizerRuns', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}
          </>
        )}

        {node.type === 'deploy' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Network
              </label>
              <select
                value={node.config.network || 'asset-hub-testnet'}
                onChange={(e) => handleInputChange('network', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="asset-hub-testnet">Asset Hub Testnet</option>
                <option value="asset-hub-mainnet">Asset Hub Mainnet</option>
                <option value="local">Local Development</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gas Limit
              </label>
              <input
                type="text"
                value={node.config.gasLimit || '2000000'}
                onChange={(e) => handleInputChange('gasLimit', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gas Price
              </label>
              <select
                value={node.config.gasPrice || 'auto'}
                onChange={(e) => handleInputChange('gasPrice', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="auto">Auto</option>
                <option value="fast">Fast</option>
                <option value="standard">Standard</option>
                <option value="slow">Slow</option>
              </select>
            </div>
          </>
        )}

        {node.type === 'test' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Framework
              </label>
              <select
                value={node.config.testSuite || 'foundry'}
                onChange={(e) => handleInputChange('testSuite', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="foundry">Foundry</option>
                <option value="hardhat">Hardhat</option>
                <option value="truffle">Truffle</option>
                <option value="integration">Integration Tests</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={node.config.coverage || false}
                onChange={(e) => handleInputChange('coverage', e.target.checked)}
                className="rounded"
              />
              <label className="text-sm text-gray-700">Generate Coverage Report</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={node.config.gasReport || false}
                onChange={(e) => handleInputChange('gasReport', e.target.checked)}
                className="rounded"
              />
              <label className="text-sm text-gray-700">Generate Gas Report</label>
            </div>
          </>
        )}

        {node.type === 'verify' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explorer
            </label>
            <select
              value={node.config.explorer || 'polkadot-js'}
              onChange={(e) => handleInputChange('explorer', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="polkadot-js">Polkadot.js Apps</option>
              <option value="subscan">Subscan</option>
              <option value="custom">Custom Explorer</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex text-black">
      {/* Sidebar - Node Palette */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Solidity Pipeline</h3>
        
        {/* Templates */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Templates</h4>
          <div className="space-y-2">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => loadTemplate(key)}
                className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        {/* Node Types */}
        <div className="space-y-2">
          {Object.entries(nodeTypes).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
                onDrop={(e) => handleDrop(e)}
                onDragOver={(e) => handleDragOver(e)}
                className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded cursor-move hover:shadow-md transition-shadow"
              >
                <div className={`p-2 rounded ${config.color}`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
          <button
            onClick={executePipeline}
            disabled={isExecuting || nodes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {isExecuting ? 'Executing...' : 'Run Pipeline'}
          </button>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>🔗 EVM Compatible</span>
            <span>🏗️ Asset Hub Polkadot</span>
            <span>⚡ Solidity Ready</span>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 relative overflow-auto bg-gray-100"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />

            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((connection, index) => {
                const fromNode = nodes.find(n => n.id === connection.from);
                const toNode = nodes.find(n => n.id === connection.to);
                if (!fromNode || !toNode) return null;
                
                return (
                  <line
                    key={index}
                    x1={fromNode.x + 100}
                    y1={fromNode.y + 30}
                    x2={toNode.x}
                    y2={toNode.y + 30}
                    stroke="#6366f1"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6366f1"
                  />
                </marker>
              </defs>
            </svg>

            {/* Nodes */}
            {nodes.map((node) => {
              const NodeIcon = nodeTypes[node.type]?.icon || Settings;
              const nodeColor = nodeTypes[node.type]?.color || 'bg-gray-500';
              
              return (
                <div
                  key={node.id}
                  className={`absolute bg-white border-2 rounded-lg shadow-md p-3 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedNode === node.id ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  style={{ left: node.x, top: node.y, width: '220px' }}
                  onClick={() => setSelectedNode(node.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${nodeColor}`}>
                      <NodeIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-sm">{nodeTypes[node.type]?.label}</span>
                    {getStatusIcon(node.id)}
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    {node.type === 'import' && `📄 ${node.config.contractFile}`}
                    {node.type === 'compile' && `🔧 Solc ${node.config.solcVersion}`}
                    {node.type === 'deploy' && `🌐 ${node.config.network}`}
                    {node.type === 'test' && `🧪 ${node.config.testSuite} tests`}
                    {node.type === 'verify' && `🔍 ${node.config.explorer}`}
                    {node.type === 'gasOptimize' && `⛽ ${node.config.runs} runs`}
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Build your Solidity deployment pipeline</p>
                  <p className="text-sm text-gray-500">Drag components or choose a template</p>
                </div>
              </div>
            )}
          </div>

          {/* Execution Logs Panel */}
          {executionLogs.length > 0 && (
            <div className="w-80 bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-y-auto">
              <h3 className="text-white mb-2">Execution Logs</h3>
              {executionLogs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          <SolidityNodeConfig 
            node={nodes.find(n => n.id === selectedNode)}
            onUpdate={(config) => {
              setNodes(prev => prev.map(n => 
                n.id === selectedNode ? { ...n, config: { ...n.config, ...config } } : n
              ));
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PipelineBuilder;