import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { basename, join, dirname } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

interface RustCompilationResult {
  bytecode?: Buffer;
  abi?: string[];
  warnings?: string[];
  error?: string;
  contractName?: string;
}

// Helper function to find a working nightly toolchain
const findWorkingToolchain = async (): Promise<string> => {
  // List of known working nightly versions for RISC-V
  const candidateVersions = [
    'nightly-2024-04-15',
    'nightly-2024-04-01',
    'nightly-2024-03-15',
    'nightly-2024-03-01',
    'nightly-2024-02-15',
    'nightly-2024-02-01',
    'nightly-2024-01-15',
    'nightly-2024-01-01',
    'nightly-2023-12-15',
    'nightly-2023-12-01'
  ];

  for (const version of candidateVersions) {
    try {
      // Try to install the toolchain
      await execAsync(`rustup toolchain install ${version} --profile minimal --component rust-src`);
      
      // Check if RISC-V target is available
      await execAsync(`rustup target add riscv32ima-unknown-none-elf --toolchain ${version}`);
      
      console.log(`Found working toolchain: ${version}`);
      return version;
    } catch (error) {
      console.log(`Toolchain ${version} not available, trying next...`);
      continue;
    }
  }
  
  throw new Error('No working nightly toolchain found for RISC-V target');
};

// Helper function to create temporary project structure
const createTempRustProject = async (
  rustCode: string,
  projectName: string = 'temp_contract',
  toolchain: string = 'nightly'
): Promise<string> => {
  const tempDir = join(tmpdir(), `rust_contract_${randomUUID()}`);
  
  // Create project structure
  mkdirSync(tempDir, { recursive: true });
  mkdirSync(join(tempDir, 'src'), { recursive: true });
  mkdirSync(join(tempDir, '.cargo'), { recursive: true });
  
  // Write Cargo.toml with updated dependencies
  const cargoToml = `[package]
name = "${projectName}"
version = "0.1.0"
edition = "2021"

[dependencies]
# Using a more stable version or alternative approach
# pallet-revive-uapi = { git = "https://github.com/paritytech/polkadot-sdk", branch = "master" }

[profile.release]
opt-level = "z"
lto = true
codegen-units = 1
panic = "abort"
strip = true

[[bin]]
name = "${projectName}"
path = "src/main.rs"
`;

  // Write .cargo/config.toml
  const cargoConfig = `[build]
target = "riscv32ima-unknown-none-elf"

[target.riscv32ima-unknown-none-elf]
# runner = "polkatool run"
`;

  // Write rust-toolchain.toml with dynamic toolchain
  const rustToolchain = `[toolchain]
channel = "${toolchain}"
components = ["rust-src"]
targets = ["riscv32ima-unknown-none-elf"]
`;

  // Write updated Makefile
  const makefile = `TOOLCHAIN = +${toolchain}

build:
\tcargo $(TOOLCHAIN) build --release --target riscv32ima-unknown-none-elf
\t@if command -v polkatool >/dev/null 2>&1; then \\
\t\tpolkatool link target/riscv32ima-unknown-none-elf/release/${projectName} -o contract.polkavm; \\
\telse \\
\t\tcp target/riscv32ima-unknown-none-elf/release/${projectName} contract.bin; \\
\tfi

clean:
\tcargo clean

.PHONY: build clean
`;

  // Write files
  writeFileSync(join(tempDir, 'Cargo.toml'), cargoToml);
  writeFileSync(join(tempDir, '.cargo', 'config.toml'), cargoConfig);
  writeFileSync(join(tempDir, 'rust-toolchain.toml'), rustToolchain);
  writeFileSync(join(tempDir, 'Makefile'), makefile);
  writeFileSync(join(tempDir, 'src', 'main.rs'), rustCode);
  
  return tempDir;
};

// Helper function to extract function signatures from Rust code for ABI generation
const extractRustFunctions = (rustCode: string): string[] => {
  const abi: string[] = [];
  
  // Look for constructor
  if (rustCode.includes('#[no_mangle]') && rustCode.includes('pub extern "C" fn constructor')) {
    abi.push('constructor()');
  }
  
  // Extract public extern "C" functions
  const functionRegex = /#\[no_mangle\]\s*pub\s+extern\s+"C"\s+fn\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^{]+))?\s*\{/g;
  let match;
  
  while ((match = functionRegex.exec(rustCode)) !== null) {
    const [, functionName, params, returnType] = match;
    
    if (functionName === 'constructor') continue; // Already handled
    
    // Parse parameters
    const paramTypes = params
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => {
        // Convert Rust types to Solidity types
        const type = p.split(':')[1]?.trim();
        if (!type) return 'uint256';
        
        if (type.includes('u32')) return 'uint32';
        if (type.includes('u64')) return 'uint64';
        if (type.includes('u256')) return 'uint256';
        if (type.includes('i32')) return 'int32';
        if (type.includes('i64')) return 'int64';
        if (type.includes('bool')) return 'bool';
        if (type.includes('&str')) return 'string';
        
        return 'uint256'; // Default
      });
    
    // Parse return type
    let solReturnType = '';
    if (returnType) {
      const cleanReturnType = returnType.trim();
      if (cleanReturnType.includes('u32')) solReturnType = 'uint32';
      else if (cleanReturnType.includes('u64')) solReturnType = 'uint64';
      else if (cleanReturnType.includes('u256')) solReturnType = 'uint256';
      else if (cleanReturnType.includes('i32')) solReturnType = 'int32';
      else if (cleanReturnType.includes('i64')) solReturnType = 'int64';
      else if (cleanReturnType.includes('bool')) solReturnType = 'bool';
      else solReturnType = 'uint256';
    }
    
    // Build ABI entry
    const paramString = paramTypes.length > 0 ? paramTypes.join(',') : '';
    const returnString = solReturnType ? ` returns(${solReturnType})` : '';
    const viewModifier = returnType ? ' view' : '';
    
    abi.push(`function ${functionName}(${paramString})${viewModifier} external${returnString}`);
  }
  
  return abi;
};

const compileRustContract = async (
  rustCode: string,
  contractName: string = 'contract',
  outputDir?: string
): Promise<RustCompilationResult> => {
  let tempDir: string | null = null;
  
  try {
    console.log('Compiling Rust contract...');
    
    // Check if required tools are available
    try {
      await execAsync('cargo --version');
      console.log('Cargo is available');
    } catch (error) {
      return {
        error: 'Cargo not found. Please install Rust toolchain:\n' +
               'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh'
      };
    }

    // Find a working toolchain
    let workingToolchain: string;
    try {
      workingToolchain = await findWorkingToolchain();
    } catch (error) {
      return {
        error: 'Failed to find a working nightly toolchain with RISC-V support. ' +
               'Please check https://rust-lang.github.io/rustup-components-history for available versions.'
      };
    }
    
    // Create temporary project
    tempDir = await createTempRustProject(rustCode, contractName, workingToolchain);
    console.log(`Created temp project at: ${tempDir}`);
    
    // Compile the contract
    const { stdout: buildOutput, stderr: buildError } = await execAsync('make build', { 
      cwd: tempDir,
      timeout: 180000 // 3 minutes timeout
    });
    
    console.log('Build output:', buildOutput);
    if (buildError) {
      console.warn('Build stderr:', buildError);
    }
    
    // Check for compiled output (either .polkavm or .bin)
    let contractPath = join(tempDir, 'contract.polkavm');
    let bytecode: Buffer;
    
    if (existsSync(contractPath)) {
      bytecode = readFileSync(contractPath);
      console.log(`PolkaVM contract compiled successfully, size: ${bytecode.length} bytes`);
    } else {
      // Fallback to binary file
      contractPath = join(tempDir, 'contract.bin');
      if (existsSync(contractPath)) {
        bytecode = readFileSync(contractPath);
        console.log(`Binary contract compiled successfully, size: ${bytecode.length} bytes`);
      } else {
        // Try to find the compiled binary in target directory
        const binaryPath = join(tempDir, `target/riscv32ima-unknown-none-elf/release/${contractName}`);
        if (existsSync(binaryPath)) {
          bytecode = readFileSync(binaryPath);
          console.log(`Raw binary found, size: ${bytecode.length} bytes`);
        } else {
          return {
            error: 'Compilation failed: No output binary generated.\n' + 
                   (buildError || 'Unknown build error')
          };
        }
      }
    }
    
    // Generate ABI from Rust code analysis
    const abi = extractRustFunctions(rustCode);
    
    // Parse warnings from build output
    const warnings: string[] = [];
    if (buildError) {
      const warningLines = buildError.split('\n')
        .filter(line => line.includes('warning:'))
        .map(line => line.trim());
      warnings.push(...warningLines);
    }
    
    // Save files if outputDir is provided
    if (outputDir) {
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      // Save bytecode
      const bytecodeOutputPath = join(outputDir, `${contractName}.bin`);
      writeFileSync(bytecodeOutputPath, bytecode);
      console.log(`Bytecode saved to ${bytecodeOutputPath}`);
      
      // Save ABI
      const abiOutputPath = join(outputDir, `${contractName}_abi.json`);
      writeFileSync(abiOutputPath, JSON.stringify(abi, null, 2));
      console.log(`ABI saved to ${abiOutputPath}`);
    }
    
    return {
      bytecode,
      abi,
      contractName,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    console.error('Rust compilation error:', error);
    
    let errorMessage = 'Unknown compilation error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide more specific error messages
      if (errorMessage.includes('command not found')) {
        errorMessage = 'Required tools not installed. Please install Rust toolchain.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Compilation timeout. The contract might be too complex or the build environment is slow.';
      } else if (errorMessage.includes('cargo build')) {
        errorMessage = 'Cargo build failed. Check your Rust code for syntax errors:\n' + errorMessage;
      }
    }
    
    return { error: errorMessage };
    
  } finally {
    // Cleanup temporary directory
    if (tempDir) {
      try {
        await execAsync(`rm -rf "${tempDir}"`);
        console.log('Cleaned up temporary directory');
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary directory:', cleanupError);
      }
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract parameters
    const { 
      rustCode, 
      contractName = 'contract', 
      outputDir, 
      saveFiles = false 
    } = body;
    
    // Validate input
    if (!rustCode || typeof rustCode !== 'string') {
      return NextResponse.json(
        { error: 'rustCode is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Compile the contract
    const finalOutputDir = saveFiles ? (outputDir || './rust_artifacts/') : undefined;
    const result = await compileRustContract(rustCode, contractName, finalOutputDir);
    
    // Convert bytecode to hex string for JSON response
    const response = {
      ...result,
      bytecode: result.bytecode ? result.bytecode.toString('hex') : undefined
    };
    
    return NextResponse.json(response, { 
      status: result.error ? 500 : 200 
    });
    
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
  // Test endpoint with a simple Rust contract
  const testRustCode = `#![no_std]
#![no_main]

// Simple no-std Rust program for RISC-V
#[no_mangle]
pub extern "C" fn _start() {
    // Entry point
}

#[no_mangle]
pub extern "C" fn constructor() {
    // Constructor logic
}

#[no_mangle]
pub extern "C" fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    let mut a = 0;
    let mut b = 1;
    for _ in 2..=n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    b
}

#[no_mangle]
pub extern "C" fn add(a: u32, b: u32) -> u32 {
    a + b
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}`;

  const result = await compileRustContract(testRustCode, 'test_contract');
  
  // Convert bytecode to hex string for JSON response
  const response = {
    ...result,
    bytecode: result.bytecode ? result.bytecode.toString('hex') : undefined
  };

  return NextResponse.json(response, { 
    status: result.error ? 500 : 200 
  });
}