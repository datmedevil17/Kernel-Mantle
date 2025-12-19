'use client'
import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ContractBlock {
  x: number;
  y: number;
  z: number;
  type: 'constructor' | 'function' | 'variable' | 'modifier' | 'event' | 'mapping';
  name: string;
  params?: string[];
  visibility?: 'public' | 'private' | 'internal' | 'external';
  payable?: boolean;
  returns?: string;
}

const MinecraftSolidityBuilder: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const raycasterRef = useRef<THREE.Raycaster>(null);
  const mouseRef = useRef<THREE.Vector2>(null);
  
  const [contractBlocks, setContractBlocks] = useState<ContractBlock[]>([]);
  const [selectedBlockType, setSelectedBlockType] = useState<ContractBlock['type']>('function');
  const [isPlacing, setIsPlacing] = useState(true);
  const [generatedCode, setGeneratedCode] = useState('');
  const [contractName, setContractName] = useState('MyContract');

  // Camera control state
  const [isDragging, setIsDragging] = useState(false);
  const [isRightClick, setIsRightClick] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const spherical = useRef(new THREE.Spherical(15, Math.PI / 4, Math.PI / 4));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const panOffset = useRef(new THREE.Vector3());

  // Block configuration modal
  const [showBlockConfig, setShowBlockConfig] = useState(false);
  const [configBlock, setConfigBlock] = useState<Partial<ContractBlock>>({});

  const blockColors = {
    constructor: 0xFF6B6B,  // Red - Foundation
    function: 0x4ECDC4,     // Teal - Actions
    variable: 0xFFE66D,     // Yellow - Storage
    modifier: 0xA8E6CF,     // Green - Rules
    event: 0xFFB74D,        // Orange - Notifications
    mapping: 0x9C88FF       // Purple - Data structures
  };

  const blockMeshes = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(800, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Raycaster and mouse
    raycasterRef.current = new THREE.Raycaster();
    mouseRef.current = new THREE.Vector2();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground plane (invisible, for placement reference)
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
    gridHelper.position.y = -0.49;
    scene.add(gridHelper);

    mountRef.current.appendChild(renderer.domElement);

    // Update camera position
    updateCameraPosition();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update camera position based on spherical coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    
    const camera = cameraRef.current;
    const position = new THREE.Vector3();
    position.setFromSpherical(spherical.current);
    position.add(target.current);
    
    camera.position.copy(position);
    camera.lookAt(target.current);
  };

  // Update blocks in scene when contractBlocks state changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing block meshes
    blockMeshes.current.forEach(mesh => {
      sceneRef.current!.remove(mesh);
    });
    blockMeshes.current.clear();

    // Add new block meshes
    contractBlocks.forEach(block => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshLambertMaterial({ 
        color: blockColors[block.type] 
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(block.x, block.y, block.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 256;
      context.fillStyle = 'white';
      context.font = 'Bold 20px Arial';
      context.textAlign = 'center';
      context.fillText(block.type.toUpperCase(), 128, 128);
      context.fillText(block.name, 128, 160);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const labelGeometry = new THREE.PlaneGeometry(1, 1);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(block.x, block.y + 0.6, block.z);
      label.lookAt(cameraRef.current!.position);
      
      const key = `${block.x}-${block.y}-${block.z}`;
      blockMeshes.current.set(key, mesh);
      sceneRef.current!.add(mesh);
      sceneRef.current!.add(label);
    });
  }, [contractBlocks]);

  const getMousePosition = (event: React.MouseEvent) => {
    if (!rendererRef.current) return;
    
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    mouseRef.current!.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current!.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setIsRightClick(event.button === 2);
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastMousePos.current.x;
    const deltaY = event.clientY - lastMousePos.current.y;

    if (isRightClick) {
      // Pan camera
      const camera = cameraRef.current!;
      const distance = camera.position.distanceTo(target.current);
      
      const panLeft = new THREE.Vector3();
      const panUp = new THREE.Vector3();
      
      panLeft.setFromMatrixColumn(camera.matrix, 0);
      panUp.setFromMatrixColumn(camera.matrix, 1);
      
      panLeft.multiplyScalar(-deltaX * distance * 0.0005);
      panUp.multiplyScalar(deltaY * distance * 0.0005);
      
      panOffset.current.copy(panLeft).add(panUp);
      target.current.add(panOffset.current);
    } else {
      // Orbit camera
      spherical.current.theta -= deltaX * 0.01;
      spherical.current.phi += deltaY * 0.01;
      
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.current.phi));
    }

    updateCameraPosition();
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setIsRightClick(false);
    
    const deltaX = Math.abs(event.clientX - lastMousePos.current.x);
    const deltaY = Math.abs(event.clientY - lastMousePos.current.y);
    
    if (deltaX < 5 && deltaY < 5 && event.button === 0) {
      handleBlockClick(event);
    }
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    
    const zoomSpeed = 0.1;
    spherical.current.radius += event.deltaY * zoomSpeed;
    spherical.current.radius = Math.max(2, Math.min(50, spherical.current.radius));
    
    updateCameraPosition();
  };

  const handleBlockClick = (event: React.MouseEvent) => {
    if (!raycasterRef.current || !mouseRef.current || !cameraRef.current) return;

    getMousePosition(event);
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    const allMeshes = Array.from(blockMeshes.current.values());
    const intersects = raycasterRef.current.intersectObjects(allMeshes);

    if (isPlacing) {
      if (intersects.length > 0) {
        // Place on face of existing block
        const intersect = intersects[0];
        const face = intersect.face;
        if (!face) return;

        const normal = face.normal.clone();
        normal.transformDirection(intersect.object.matrixWorld);
        
        const newPos = intersect.object.position.clone();
        newPos.add(normal);

        const x = Math.round(newPos.x);
        const y = Math.round(newPos.y);
        const z = Math.round(newPos.z);

        const exists = contractBlocks.some(block => 
          block.x === x && block.y === y && block.z === z
        );

        if (!exists) {
          setConfigBlock({
            x, y, z, 
            type: selectedBlockType,
            name: `${selectedBlockType}${contractBlocks.length + 1}`,
            visibility: 'public'
          });
          setShowBlockConfig(true);
        }
      } else {
        // Place on ground
        const groundIntersects = raycasterRef.current.intersectObjects(
          sceneRef.current!.children.filter(child => 
            child instanceof THREE.Mesh && child.material.transparent
          )
        );
        
        if (groundIntersects.length > 0) {
          const point = groundIntersects[0].point;
          const x = Math.floor(point.x + 0.5);
          const y = 0;
          const z = Math.floor(point.z + 0.5);

          const exists = contractBlocks.some(block => 
            block.x === x && block.y === y && block.z === z
          );

          if (!exists) {
            setConfigBlock({
              x, y, z, 
              type: selectedBlockType,
              name: `${selectedBlockType}${contractBlocks.length + 1}`,
              visibility: 'public'
            });
            setShowBlockConfig(true);
          }
        }
      }
    } else {
      // Remove block
      if (intersects.length > 0) {
        const pos = intersects[0].object.position;
        const x = Math.round(pos.x);
        const y = Math.round(pos.y);
        const z = Math.round(pos.z);

        setContractBlocks(prev => prev.filter(block => 
          !(block.x === x && block.y === y && block.z === z)
        ));
      }
    }
  };

  const confirmBlockPlacement = () => {
    if (configBlock.x !== undefined && configBlock.y !== undefined && configBlock.z !== undefined) {
      setContractBlocks(prev => [...prev, configBlock as ContractBlock]);
      setShowBlockConfig(false);
      setConfigBlock({});
    }
  };

  const generateContract = () => {
    let code = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract ${contractName} {\n`;

    // Sort blocks by type priority and position
    const sortedBlocks = [...contractBlocks].sort((a, b) => {
      const typePriority = { variable: 1, mapping: 2, constructor: 3, modifier: 4, function: 5, event: 6 };
      if (typePriority[a.type] !== typePriority[b.type]) {
        return typePriority[a.type] - typePriority[b.type];
      }
      return a.y - b.y; // Higher blocks first
    });

    sortedBlocks.forEach(block => {
      code += `    // Block at position (${block.x}, ${block.y}, ${block.z})\n`;
      
      switch (block.type) {
        case 'variable':
          code += `    ${block.visibility || 'public'} ${block.returns || 'uint256'} ${block.name};\n\n`;
          break;
          
        case 'mapping':
          code += `    mapping(address => ${block.returns || 'uint256'}) ${block.visibility || 'public'} ${block.name};\n\n`;
          break;
          
        case 'constructor':
          const constructorParams = block.params?.join(', ') || '';
          code += `    constructor(${constructorParams}) {\n`;
          code += `        // Constructor logic for ${block.name}\n`;
          code += `    }\n\n`;
          break;
          
        case 'modifier':
          code += `    modifier ${block.name}() {\n`;
          code += `        // Modifier logic\n`;
          code += `        _;\n`;
          code += `    }\n\n`;
          break;
          
        case 'function':
          const functionParams = block.params?.join(', ') || '';
          const payableStr = block.payable ? ' payable' : '';
          const returnsStr = block.returns ? ` returns (${block.returns})` : '';
          code += `    function ${block.name}(${functionParams}) ${block.visibility || 'public'}${payableStr}${returnsStr} {\n`;
          code += `        // Function logic for ${block.name}\n`;
          code += `    }\n\n`;
          break;
          
        case 'event':
          const eventParams = block.params?.join(', ') || '';
          code += `    event ${block.name}(${eventParams});\n\n`;
          break;
      }
    });

    code += '}';
    setGeneratedCode(code);
  };

  const resetCamera = () => {
    spherical.current.set(15, Math.PI / 4, Math.PI / 4);
    target.current.set(0, 0, 0);
    updateCameraPosition();
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-gray-100 rounded-lg">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-4 text-center">⛏️ Minecraft Solidity Visual Contract Builder</h1>
        
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlacing(true)}
              className={`px-4 py-2 rounded ${
                isPlacing 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              Place Mode
            </button>
            <button
              onClick={() => setIsPlacing(false)}
              className={`px-4 py-2 rounded ${
                !isPlacing 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              Remove Mode
            </button>
          </div>
          
          <div className="flex gap-2">
            {Object.keys(blockColors).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedBlockType(type as ContractBlock['type'])}
                className={`px-3 py-2 rounded capitalize ${
                  selectedBlockType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
                style={{
                  backgroundColor: selectedBlockType === type 
                    ? undefined 
                    : `#${blockColors[type as ContractBlock['type']].toString(16).padStart(6, '0')}`
                }}
              >
                {type}
              </button>
            ))}
          </div>
          
          <input
            type="text"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            className="px-3 py-2 border rounded"
            placeholder="Contract Name"
          />
          
          <button
            onClick={generateContract}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Generate Contract
          </button>
          
          <button
            onClick={resetCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset Camera
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div 
            ref={mountRef} 
            className="border-2 border-gray-400 rounded-lg overflow-hidden mx-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
            style={{ 
              width: '600px', 
              height: '500px',
              cursor: isDragging ? (isRightClick ? 'move' : 'grabbing') : 'grab'
            }}
          />
          
          <div className="mt-2 text-center text-gray-600">
            <p><strong>Controls:</strong> Left-drag: Orbit • Right-drag: Pan • Scroll: Zoom • Click: Place/Remove</p>
            <p><strong>Blocks placed:</strong> {contractBlocks.length}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">Generated Solidity Contract:</h3>
          <textarea
            value={generatedCode}
            readOnly
            className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded border"
            placeholder="Place blocks and click 'Generate Contract' to see the Solidity code..."
          />
        </div>
      </div>

      {/* Block Configuration Modal */}
      {showBlockConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Configure {configBlock.type} Block</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Name:</label>
                <input
                  type="text"
                  value={configBlock.name || ''}
                  onChange={(e) => setConfigBlock(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">Visibility:</label>
                <select
                  value={configBlock.visibility || 'public'}
                  onChange={(e) => setConfigBlock(prev => ({ ...prev, visibility: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                  <option value="internal">internal</option>
                  <option value="external">external</option>
                </select>
              </div>
              
              {configBlock.type === 'function' && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2">Parameters (comma-separated):</label>
                    <input
                      type="text"
                      value={configBlock.params?.join(', ') || ''}
                      onChange={(e) => setConfigBlock(prev => ({ 
                        ...prev, 
                        params: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                      }))}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="uint256 _amount, address _to"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={configBlock.payable || false}
                        onChange={(e) => setConfigBlock(prev => ({ ...prev, payable: e.target.checked }))}
                        className="mr-2"
                      />
                      Payable
                    </label>
                  </div>
                </>
              )}
              
              {(configBlock.type === 'function' || configBlock.type === 'variable' || configBlock.type === 'mapping') && (
                <div>
                  <label className="block text-sm font-bold mb-2">Return Type:</label>
                  <input
                    type="text"
                    value={configBlock.returns || ''}
                    onChange={(e) => setConfigBlock(prev => ({ ...prev, returns: e.target.value }))}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="uint256"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={confirmBlockPlacement}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Place Block
              </button>
              <button
                onClick={() => setShowBlockConfig(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinecraftSolidityBuilder;