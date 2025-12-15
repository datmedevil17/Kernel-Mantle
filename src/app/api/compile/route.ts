import { readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

interface CompilationResult {
  contracts: { [contractName: string]: { abi: any; bytecode: string } };
  warnings?: string[];
  error?: string;
}

// Dynamic import for resolc to handle WASM loading
const loadResolc = async () => {
  try {
    // Set WASM path before importing
    process.env.RESOLC_WASM_PATH = join(process.cwd(), 'public', 'resolc.wasm');
    
    const { compile } = await import('@parity/resolc');
    return compile;
  } catch (error) {
    console.error('Failed to load resolc:', error);
    throw new Error('Failed to load Solidity compiler');
  }
};

const compileFromSources = async (
  sources: { [key: string]: { content: string } },
  outputDir?: string
): Promise<CompilationResult> => {
  try {
    console.log('Compiling contracts from sources...');

    // Dynamically load the compile function
    const compile = await loadResolc();

    // Compile the contract using the provided sources
    const out = await compile(sources);
    const contracts: { [contractName: string]: { abi: any; bytecode: string } } = {};
    const warnings: string[] = [];

    // Process compilation output
    for (const [sourcePath, sourceContracts] of Object.entries(out.contracts)) {
      for (const [name, contract] of Object.entries(sourceContracts)) {
        console.log(`Compiled contract: ${name}`);

        // Extract ABI
        const abi = contract.abi;

        // Extract bytecode
        let bytecode = '';
        if (
          contract.evm &&
          contract.evm.bytecode &&
          contract.evm.bytecode.object
        ) {
          bytecode = contract.evm.bytecode.object;
          console.log(`Bytecode found for contract: ${name}`);
        } else {
          warnings.push(`No bytecode found for contract: ${name}`);
          console.warn(`No bytecode found for contract: ${name}`);
        }

        contracts[name] = { abi, bytecode };

        // Optionally write files if outputDir is provided
        if (outputDir) {
          // Write the ABI
          const abiPath = join(outputDir, `${name}.json`);
          writeFileSync(abiPath, JSON.stringify(abi, null, 2));
          console.log(`ABI saved to ${abiPath}`);

          // Write the bytecode
          if (bytecode) {
            const bytecodePath = join(outputDir, `${name}.polkavm`);
            writeFileSync(bytecodePath, Buffer.from(bytecode, 'hex'));
            console.log(`Bytecode saved to ${bytecodePath}`);
          }
        }
      }
    }

    return { contracts, warnings: warnings.length > 0 ? warnings : undefined };
  } catch (error) {
    console.error('Error compiling contracts:', error);
    
    // Provide more specific error messages
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return {
        contracts: {},
        error: 'WASM file not found. Please ensure the WASM file is in the public directory and accessible.',
      };
    }
    
    return {
      contracts: {},
      error: error instanceof Error ? error.message : 'Unknown compilation error',
    };
  }
};

const compileFromFile = async (
  solidityFilePath: string,
  outputDir?: string
): Promise<CompilationResult> => {
  try {
    // Construct the sources object for the compiler
    const sources = {
      [`contracts/${basename(solidityFilePath)}`]: {
        content: readFileSync(solidityFilePath, 'utf8'),
      },
    };

    return await compileFromSources(sources, outputDir);
  } catch (error) {
    console.error('Error reading file:', error);
    return {
      contracts: {},
      error: error instanceof Error ? error.message : 'Error reading file',
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both formats: sources object or file path
    if (body.sources) {
      // Frontend format: { sources: { "contracts/file.sol": { content: "..." } } }
      const { sources, outputDir, saveFiles = false } = body;
      
      const finalOutputDir = saveFiles ? (outputDir || './artifacts/') : undefined;
      const result = await compileFromSources(sources, finalOutputDir);
      
      return NextResponse.json(result, { 
        status: result.error ? 500 : 200 
      });
      
    } else if (body.solidityFilePath) {
      // File path format: { solidityFilePath: "./contracts/file.sol" }
      const { solidityFilePath, outputDir, saveFiles = false } = body;
      
      const finalOutputDir = saveFiles ? (outputDir || './artifacts/') : undefined;
      const result = await compileFromFile(solidityFilePath, finalOutputDir);
      
      return NextResponse.json(result, { 
        status: result.error ? 500 : 200 
      });
      
    } else {
      return NextResponse.json(
        { error: 'Either sources object or solidityFilePath is required' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Default compilation with hardcoded values (for testing)
  const solidityFilePath = './contracts/Storage.sol';

  const result = await compileFromFile(solidityFilePath);

  return NextResponse.json(result, { 
    status: result.error ? 500 : 200 
  });
}