import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SolidityEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: string;
}

// Solidity keywords and types
const SOLIDITY_KEYWORDS = [
  'pragma', 'solidity', 'contract', 'interface', 'library', 'abstract',
  'function', 'modifier', 'event', 'struct', 'enum', 'mapping',
  'public', 'private', 'internal', 'external', 'pure', 'view', 'payable',
  'constant', 'immutable', 'override', 'virtual', 'returns', 'return',
  'if', 'else', 'for', 'while', 'do', 'break', 'continue',
  'try', 'catch', 'throw', 'revert', 'require', 'assert',
  'new', 'delete', 'this', 'super', 'using', 'is', 'as',
  'import', 'from', 'constructor', 'fallback', 'receive',
  'emit', 'indexed', 'anonymous', 'assembly', 'memory', 'storage', 'calldata',
  'true', 'false', 'null', 'undefined'
];

const SOLIDITY_TYPES = [
  'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
  'int', 'int8', 'int16', 'int32', 'int64', 'int128', 'int256',
  'bytes', 'bytes1', 'bytes2', 'bytes4', 'bytes8', 'bytes16', 'bytes32',
  'string', 'bool', 'address', 'payable'
];

const COMMON_FUNCTIONS = [
  'require(condition, "message")',
  'assert(condition)',
  'revert("message")',
  'msg.sender',
  'msg.value',
  'msg.data',
  'block.timestamp',
  'block.number',
  'block.difficulty',
  'tx.origin',
  'tx.gasprice',
  'gasleft()',
  'keccak256(abi.encodePacked())',
  'sha256()',
  'ecrecover()',
  'address(this).balance',
  'selfdestruct(address)',
  'abi.encode()',
  'abi.encodePacked()',
  'abi.decode()',
  'SafeMath.add()',
  'SafeMath.sub()',
  'SafeMath.mul()',
  'SafeMath.div()'
];

const CONTRACT_TEMPLATES = [
  {
    name: 'Basic Contract',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    function changeOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}`
  },
  {
    name: 'ERC20 Token',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ERC20Token is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public name;
    string public symbol;
    uint8 public decimals;
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _totalSupply * 10**_decimals;
        _balances[msg.sender] = _totalSupply;
    }
}`
  }
];

export const SolidityEditor = ({ value = '', onChange }: SolidityEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [code, setCode] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showTemplates, setShowTemplates] = useState(false);

  // Syntax highlighting function
  const highlightSolidity = useCallback((code: string) => {
    let highlighted = code;
    
    // Escape HTML first
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Comments (must be before other highlighting)
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span style="color: #6B7280;">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6B7280;">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #FDE047;">$1</span>');
    highlighted = highlighted.replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #FDE047;">$1</span>');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color: #93C5FD;">$1</span>');
    
    // Keywords
    SOLIDITY_KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b(?![^<]*>)`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #C084FC; font-weight: 600;">$1</span>');
    });
    
    // Types
    SOLIDITY_TYPES.forEach(type => {
      const regex = new RegExp(`\\b(${type}(?:\\d+)?)\\b(?![^<]*>)`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #60A5FA; font-weight: 600;">$1</span>');
    });
    
    // Function names (before parentheses)
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, 
      (match, funcName) => {
        // Don't highlight if it's already in a span
        if (match.includes('<span')) return match;
        return `<span style="color: #22D3EE;">${funcName}</span>(`;
      }
    );
    
    // Addresses (0x followed by hex)
    highlighted = highlighted.replace(/\b(0x[a-fA-F0-9]+)\b/g, '<span style="color: #F97316;">$1</span>');
    
    return highlighted;
  }, []);

  // Get suggestions based on current word
  const getSuggestions = useCallback((currentWord: string, fullText: string) => {
    if (currentWord.length < 2) return [];
    
    const allSuggestions = [
      ...SOLIDITY_KEYWORDS,
      ...SOLIDITY_TYPES,
      ...COMMON_FUNCTIONS
    ];
    
    // Extract custom identifiers from the code
    const customIdentifiers = fullText.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
    const uniqueIdentifiers = [...new Set(customIdentifiers)];
    
    const filtered = [...allSuggestions, ...uniqueIdentifiers]
      .filter(suggestion => 
        suggestion.toLowerCase().startsWith(currentWord.toLowerCase()) &&
        suggestion !== currentWord
      )
      .slice(0, 10);
    
    return filtered;
  }, []);

  // Handle textarea input
  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCode(newValue);
    onChange?.(newValue);
    
    // Get current word for suggestions
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || '';
    
    // Update cursor position display
    const lines = textBeforeCursor.split('\n');
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    });
    
    // Show suggestions
    const newSuggestions = getSuggestions(currentWord, newValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0 && currentWord.length >= 2);
    setSelectedSuggestion(0);
  }, [onChange, getSuggestions]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = target.value.substring(0, start) + '    ' + target.value.substring(end);
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start + 4;
      setCode(newValue);
      onChange?.(newValue);
      return;
    }
    
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case 'Tab':
          if (suggestions[selectedSuggestion]) {
            e.preventDefault();
            insertSuggestion(target, suggestions[selectedSuggestion]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    }
    
    // Auto-complete brackets and quotes
    const autoCompleteMap: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };
    
    if (autoCompleteMap[e.key]) {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      if (e.key === '"' || e.key === "'") {
        // Check if we're closing an existing quote
        const textAfterCursor = target.value.substring(end);
        if (textAfterCursor.startsWith(e.key)) {
          e.preventDefault();
          target.selectionStart = target.selectionEnd = end + 1;
          return;
        }
      }
      
      e.preventDefault();
      const selectedText = target.value.substring(start, end);
      const newText = e.key + selectedText + autoCompleteMap[e.key];
      const newValue = target.value.substring(0, start) + newText + target.value.substring(end);
      target.value = newValue;
      target.selectionStart = target.selectionEnd = start + 1;
      setCode(newValue);
      onChange?.(newValue);
    }
  }, [showSuggestions, suggestions, selectedSuggestion, onChange]);

  // Insert suggestion
  const insertSuggestion = useCallback((textarea: HTMLTextAreaElement, suggestion: string) => {
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const textAfterCursor = textarea.value.substring(cursorPos);
    
    // Find the start of the current word
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1] || '';
    const wordStart = cursorPos - currentWord.length;
    
    // Replace current word with suggestion
    const newValue = textarea.value.substring(0, wordStart) + suggestion + textAfterCursor;
    textarea.value = newValue;
    textarea.selectionStart = textarea.selectionEnd = wordStart + suggestion.length;
    
    setShowSuggestions(false);
    setCode(newValue);
    onChange?.(newValue);
  }, [onChange]);

  // Insert template
  const insertTemplate = useCallback((template: string) => {
    if (textareaRef.current) {
      textareaRef.current.value = template;
      setCode(template);
      onChange?.(template);
      setShowTemplates(false);
      textareaRef.current.focus();
    }
  }, [onChange]);

  // Sync scroll between textarea and highlight
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (editorRef.current) {
      const target = e.target as HTMLTextAreaElement;
      editorRef.current.scrollTop = target.scrollTop;
      editorRef.current.scrollLeft = target.scrollLeft;
    }
  }, []);

  // Update code when value prop changes
  useEffect(() => {
    if (value !== code) {
      setCode(value);
      if (textareaRef.current) {
        textareaRef.current.value = value;
      }
    }
  }, [value, code]);

  return (
    <div className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 font-medium">Solidity Editor</span>
          <div className="text-xs text-gray-500">
            Line {cursorPosition.line}, Column {cursorPosition.column}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Templates
          </button>
        </div>
      </div>

      {/* Template dropdown */}
      {showTemplates && (
        <div className="absolute top-12 right-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 min-w-48">
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-2">Contract Templates</div>
            {CONTRACT_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => insertTemplate(template.code)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor container */}
      <div className="relative flex-1 overflow-hidden">
        {/* Syntax highlighted background */}
        <div
          ref={editorRef}
          className="absolute inset-0 p-4 font-mono text-sm leading-relaxed text-white pointer-events-none overflow-auto whitespace-pre-wrap break-words"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            lineHeight: '1.5',
            tabSize: 4
          }}
          dangerouslySetInnerHTML={{ __html: highlightSolidity(code) }}
        />
        
        {/* Invisible textarea for input */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-relaxed bg-transparent text-transparent caret-white resize-none outline-none border-none z-10"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            lineHeight: '1.5',
            tabSize: 4
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 max-h-48 overflow-auto min-w-48"
               style={{ 
                 top: '4rem', 
                 left: '4rem'
               }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  index === selectedSuggestion 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => textareaRef.current && insertSuggestion(textareaRef.current, suggestion)}
              >
                <div className="font-mono">{suggestion}</div>
                {COMMON_FUNCTIONS.includes(suggestion) && (
                  <div className="text-xs text-gray-400 mt-1">Built-in function</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Solidity</span>
            <span>UTF-8</span>
            <span>{code.split('\n').length} lines</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Type 2+ chars for suggestions</span>
            <span>Tab to indent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolidityEditor;