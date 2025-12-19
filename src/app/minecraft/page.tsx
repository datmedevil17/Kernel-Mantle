'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Block {
  id: string;
  type: 'function' | 'variable' | 'logic' | 'contract';
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  label: string;
  value?: string;
  connections: string[];
}

const BlockchainMinecraft: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockType, setSelectedBlockType] = useState<'function' | 'variable' | 'logic' | 'contract'>('function');
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraControls, setCameraControls] = useState({
    rotation: { x: 0, y: 0 },
    zoom: 15
  });
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const blockTypes = {
    function: { color: 0x4CAF50, label: 'Function' },
    variable: { color: 0x2196F3, label: 'Variable' },
    logic: { color: 0xFF9800, label: 'Logic' },
    contract: { color: 0x9C27B0, label: 'Contract' }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    scene.add(gridHelper);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Update camera position based on controls
      const { rotation, zoom } = cameraControls;
      camera.position.x = Math.sin(rotation.y) * zoom;
      camera.position.z = Math.cos(rotation.y) * zoom;
      camera.position.y = Math.sin(rotation.x) * zoom + 5;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    // Mouse events
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = event.movementX * 0.01;
      const deltaY = event.movementY * 0.01;
      
      setCameraControls(prev => ({
        ...prev,
        rotation: {
          x: Math.max(-Math.PI/2, Math.min(Math.PI/2, prev.rotation.x - deltaY)),
          y: prev.rotation.y - deltaX
        }
      }));
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left click
        setIsDragging(true);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (event: WheelEvent) => {
      setCameraControls(prev => ({
        ...prev,
        zoom: Math.max(5, Math.min(30, prev.zoom + event.deltaY * 0.01))
      }));
    };

    const handleClick = (event: MouseEvent) => {
      if (isDragging) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // Check for block intersections
      const blockMeshes = blocks.map(block => block.mesh);
      const intersects = raycasterRef.current.intersectObjects(blockMeshes);
      
      if (intersects.length > 0) {
        // Select block
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        const block = blocks.find(b => b.mesh === intersectedMesh);
        setSelectedBlock(block || null);
      } else {
        // Place new block
        const intersectsGround = raycasterRef.current.intersectObject(ground);
        if (intersectsGround.length > 0) {
          const point = intersectsGround[0].point;
          addBlock(Math.round(point.x), Math.round(point.z));
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('click', handleClick);

    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleClick);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [blocks, isDragging, cameraControls]);

  const addBlock = (x: number, z: number) => {
    if (!sceneRef.current) return;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ 
      color: blockTypes[selectedBlockType].color,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.set(x, 0.5, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Add outline
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const outline = new THREE.LineSegments(edges, lineMaterial);
    mesh.add(outline);

    sceneRef.current.add(mesh);

    const newBlock: Block = {
      id: `${selectedBlockType}-${Date.now()}`,
      type: selectedBlockType,
      position: new THREE.Vector3(x, 0.5, z),
      mesh,
      label: blockTypes[selectedBlockType].label,
      connections: []
    };

    setBlocks(prev => [...prev, newBlock]);
  };

  const removeBlock = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block && sceneRef.current) {
      sceneRef.current.remove(block.mesh);
      setBlocks(prev => prev.filter(b => b.id !== blockId));
      if (selectedBlock?.id === blockId) {
        setSelectedBlock(null);
      }
    }
  };

  const generateSmartContract = () => {
    const contractBlocks = blocks.filter(b => b.type === 'contract');
    const functionBlocks = blocks.filter(b => b.type === 'function');
    const variableBlocks = blocks.filter(b => b.type === 'variable');
    const logicBlocks = blocks.filter(b => b.type === 'logic');

    let contract = `// Generated Smart Contract\npragma solidity ^0.8.0;\n\n`;
    contract += `contract BlockchainMinecraft {\n`;
    
    // Add variables
    variableBlocks.forEach(block => {
      contract += `    uint256 public ${block.id.replace('-', '_')};\n`;
    });
    
    contract += `\n`;
    
    // Add functions
    functionBlocks.forEach(block => {
      contract += `    function ${block.id.replace('-', '_')}() public {\n`;
      contract += `        // Function implementation\n`;
      contract += `    }\n\n`;
    });
    
    contract += `}`;
    
    return contract;
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Main 3D Viewport */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* UI Panel */}
      <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-lg backdrop-blur">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Blockchain Minecraft</h2>
        
        {/* Block Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Block Type:</label>
          <select 
            value={selectedBlockType} 
            onChange={(e) => setSelectedBlockType(e.target.value as any)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
          >
            {Object.entries(blockTypes).map(([type, config]) => (
              <option key={type} value={type}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Instructions */}
        <div className="mb-4 text-sm text-gray-300">
          <p>• Click on ground to place blocks</p>
          <p>• Click blocks to select them</p>
          <p>• Drag to rotate camera</p>
          <p>• Scroll to zoom</p>
        </div>

        {/* Block Count */}
        <div className="mb-4">
          <p className="text-sm">Blocks: {blocks.length}</p>
          <div className="text-xs text-gray-400">
            {Object.entries(blockTypes).map(([type, config]) => (
              <div key={type}>
                {config.label}: {blocks.filter(b => b.type === type).length}
              </div>
            ))}
          </div>
        </div>

        {/* Generate Contract Button */}
        <button
          onClick={() => {
            const contract = generateSmartContract();
            console.log(contract);
            alert('Smart contract generated! Check console for code.');
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Generate Smart Contract
        </button>
      </div>

      {/* Selected Block Info */}
      {selectedBlock && (
        <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-lg backdrop-blur">
          <h3 className="text-lg font-bold mb-2 text-yellow-400">Selected Block</h3>
          <p><strong>Type:</strong> {selectedBlock.type}</p>
          <p><strong>ID:</strong> {selectedBlock.id}</p>
          <p><strong>Position:</strong> ({selectedBlock.position.x}, {selectedBlock.position.z})</p>
          
          <button
            onClick={() => removeBlock(selectedBlock.id)}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Delete Block
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-lg backdrop-blur">
        <h3 className="text-lg font-bold mb-2 text-green-400">Block Types</h3>
        {Object.entries(blockTypes).map(([type, config]) => (
          <div key={type} className="flex items-center mb-1">
            <div 
              className="w-4 h-4 rounded mr-2" 
              style={{ backgroundColor: `#${config.color.toString(16).padStart(6, '0')}` }}
            />
            <span className="text-sm">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 p-2 rounded text-sm">
        <span className="text-cyan-400">Ready to build smart contracts</span>
      </div>
    </div>
  );
};

export default BlockchainMinecraft;