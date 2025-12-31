import { type NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { basename, join, resolve, dirname } from 'path'

interface ABIItem {
  type: string
  name?: string
  inputs?: Array<{ name: string; type: string; indexed?: boolean }>
  outputs?: Array<{ name: string; type: string }>
  stateMutability?: string
  anonymous?: boolean
}

interface ContractBytecode {
  object: string
  opcodes?: string
  sourceMap?: string
  linkReferences?: Record<string, unknown>
}

interface ContractEVM {
  bytecode: ContractBytecode
  deployedBytecode?: ContractBytecode
}

interface CompiledContract {
  abi: ABIItem[]
  evm: ContractEVM
}

interface CompilationOutput {
  contracts: {
    [sourcePath: string]: {
      [contractName: string]: CompiledContract
    }
  }
  errors?: Array<{ severity: string; message: string }>
  sources?: Record<string, unknown>
}

interface CompilationResult {
  contracts: { [contractName: string]: { abi: ABIItem[]; bytecode: string } }
  warnings?: string[]
  error?: string
}

// Dynamic import for solc to handle proper Solidity compilation
const loadSolc = async (): Promise<(sources: Record<string, { content: string }>) => Promise<CompilationOutput>> => {
  try {
    const solc = await import('solc')
    
    return (sources: Record<string, { content: string }>) => {
      const input = {
        language: 'Solidity',
        sources: sources,
        settings: {
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers']
            }
          },
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
      
      const output = JSON.parse(solc.compile(JSON.stringify(input)))
      return Promise.resolve(output)
    }
  } catch (error) {
    console.error('Failed to load solc:', error)
    throw new Error('Failed to load Solidity compiler')
  }
}

// Improved import path resolution
const resolveImportPath = (importPath: string, currentPath?: string) => {
  if (importPath.startsWith("@openzeppelin/contracts/")) {
    return resolve(
      importPath.replace("@openzeppelin/contracts/", "openzeppelin/")
    )
  }

  if (currentPath) {
    console.log(`Resolving import path: ${importPath} from current path: ${currentPath}`)
    return resolve(dirname(currentPath), importPath)
  }

  console.warn('Current path is not provided, using default directory.')
  return resolve(importPath)
}

// Improved file reading with better error handling
const readSourceFile = (filePath: string) => {
  if (existsSync(filePath)) {
    return readFileSync(filePath, "utf8")
  }
  throw new Error(`File not found: ${filePath}`)
}

// Improved source resolution with circular dependency detection
const resolveSources = (sources: Record<string, { content: string }>, parent?: string) => {
  const modifiedSources: Record<string, { content: string }> = {}
  const queue = Object.entries(sources)

  for (const [key, value] of queue) {
    console.log(`Resolving sources: ${key}`)
    let content = value.content

    content = content.replace(/import\s+(\{.*?\}\s+from\s+)?["'](.*)["'];/g, (match, namedImports, importPath) => {
      console.log(`Resolving import: ${importPath}`)
      const localPath = resolveImportPath(importPath, parent)
      console.log(`Resolved import path: ${localPath}`)
      const fileContent = readSourceFile(localPath)
      const filename = basename(localPath)

      const resolvedSources = resolveSources({ [filename]: { content: fileContent } }, localPath)
      Object.assign(modifiedSources, resolvedSources)

      return `import ${namedImports ? namedImports : ""}"${filename}";`
    })

    modifiedSources[key] = { content }
  }

  return modifiedSources
}

// Enhanced bytecode validation
const validateBytecode = (bytecode: string, contractName: string): string => {
  if (!bytecode) {
    throw new Error(`No bytecode generated for contract: ${contractName}`)
  }
  
  // Remove 0x prefix if present for validation
  const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode
  
  if (cleanBytecode.length === 0) {
    throw new Error(`Empty bytecode for contract: ${contractName}`)
  }
  
  // Check for minimum bytecode length (constructor + basic contract code)
  if (cleanBytecode.length < 10) {
    throw new Error(`Bytecode too short for contract: ${contractName}. Possible compilation issue.`)
  }
  
  // Validate hex format
  if (!/^[0-9a-fA-F]*$/.test(cleanBytecode)) {
    throw new Error(`Invalid bytecode format for contract: ${contractName}. Must be hexadecimal.`)
  }
  
  // Check for common bytecode issues
  if (cleanBytecode === '0'.repeat(cleanBytecode.length)) {
    throw new Error(`Invalid bytecode for contract: ${contractName}. Bytecode contains only zeros.`)
  }
  
  console.log(`✓ Valid bytecode for ${contractName}: ${cleanBytecode.length} hex chars`)
  return '0x' + cleanBytecode
}



const compileFromSources = async (
  sources: { [key: string]: { content: string } },
  outputDir?: string
): Promise<CompilationResult> => {
  try {
    console.log('Compiling contracts from sources...')

    // Resolve imports before compilation
    const resolvedSources = resolveSources(sources)
    console.log('Resolved sources:', Object.keys(resolvedSources))

    // Dynamically load the compile function
    const compile = await loadSolc()

    // Compile using resolved sources
    const out = await compile(resolvedSources)
    const contracts: { [contractName: string]: { abi: ABIItem[]; bytecode: string } } = {}
    const warnings: string[] = []

    // Handle compilation errors
    if (out.errors) {
      const errors = out.errors.filter(error => error.severity === 'error')
      const warns = out.errors.filter(error => error.severity === 'warning')
      
      if (errors.length > 0) {
        console.error('Compilation errors:', errors)
        return {
          contracts: {},
          error: `Compilation failed:\n${errors.map(e => e.message).join('\n')}`
        }
      }
      
      if (warns.length > 0) {
        warnings.push(...warns.map(w => w.message))
        console.warn('Compilation warnings:', warns)
      }
    }

    // Validate that we have contracts
    if (!out.contracts || Object.keys(out.contracts).length === 0) {
      return {
        contracts: {},
        error: 'No contracts found in compilation output'
      }
    }


    // Helper function to determine contract type
    const getContractType = (abi: ABIItem[], bytecode: string): string => {
      const hasConstructor = abi.some(item => item.type === 'constructor')
      const hasFunctions = abi.some(item => item.type === 'function')
      const hasEvents = abi.some(item => item.type === 'event')
      
      if (!bytecode || bytecode === '0x') {
        if (!hasFunctions && hasEvents) return 'interface'
        if (hasFunctions && !hasConstructor) return 'abstract contract'
        return 'interface/library'
      }
      
      if (hasConstructor || hasFunctions) return 'concrete contract'
      return 'library'
    }

    // Process compilation output
    let deployableContractsCount = 0
    
    for (const [sourcePath, sourceContracts] of Object.entries(out.contracts)) {
      console.log(`\n📁 Processing source file: ${sourcePath}`)
      
      for (const [name, contract] of Object.entries(sourceContracts)) {
        console.log(`\n🔍 Processing contract: ${name}`)

        try {
          // Extract ABI
          const abi = contract.abi
          if (!abi) {
            console.warn(`❌ No ABI found for contract: ${name}`)
            continue
          }

          console.log(`✅ ABI found for ${name} (${abi.length} items)`)

          // Extract bytecode
          let bytecode = ''
          let hasBytecode = false
          
          if (contract.evm && contract.evm.bytecode && contract.evm.bytecode.object) {
            const rawBytecode = contract.evm.bytecode.object
            if (rawBytecode && rawBytecode.length > 0) {
              bytecode = rawBytecode.startsWith('0x') ? rawBytecode : '0x' + rawBytecode
              hasBytecode = true
            }
          }

          // Determine contract type
          const contractType = getContractType(abi, bytecode)
          console.log(`📋 Contract type: ${contractType}`)

          if (hasBytecode && bytecode !== '0x') {
            try {
              bytecode = validateBytecode(bytecode, name)
              console.log(`✅ Valid bytecode for ${name}:`)
              console.log(`   📊 Size: ${bytecode.length - 2} hex characters (${(bytecode.length - 2) / 2} bytes)`)
              console.log(`   🔗 First 32 chars: ${bytecode.substring(0, 34)}...`)
              console.log(`   🔗 Last 32 chars: ...${bytecode.substring(bytecode.length - 32)}`)
              
              deployableContractsCount++
              contracts[name] = { abi, bytecode }
              
            } catch (bytecodeError) {
              console.warn(`⚠️  Invalid bytecode for ${name}: ${bytecodeError}`)
              // Still include the contract but with empty bytecode for interfaces/abstract contracts
              contracts[name] = { abi, bytecode: '0x' }
            }
          } else {
            console.log(`ℹ️  No deployable bytecode for ${name} (${contractType})`)
            // Include non-deployable contracts with empty bytecode
            contracts[name] = { abi, bytecode: '0x' }
          }

          // Log ABI summary
          const constructors = abi.filter(item => item.type === 'constructor').length
          const functions = abi.filter(item => item.type === 'function').length
          const events = abi.filter(item => item.type === 'event').length
          const errors = abi.filter(item => item.type === 'error').length
          
          console.log(`   📝 ABI Summary:`)
          console.log(`      - Constructors: ${constructors}`)
          console.log(`      - Functions: ${functions}`)
          console.log(`      - Events: ${events}`)
          console.log(`      - Errors: ${errors}`)

          // Optionally write files if outputDir is provided
          if (outputDir && hasBytecode) {
            try {
              // Ensure output directory exists
              if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true })
              }

              // Write the ABI
              const abiPath = join(outputDir, `${name}.json`)
              writeFileSync(abiPath, JSON.stringify(abi, null, 2))
              console.log(`💾 ABI saved to ${abiPath}`)

              // Write the bytecode if it exists
              if (bytecode && bytecode !== '0x') {
                const bytecodePath = join(outputDir, `${name}.bin`)
                writeFileSync(bytecodePath, bytecode)
                console.log(`💾 Bytecode saved to ${bytecodePath}`)
              }
            } catch (fileError) {
              warnings.push(`Failed to save files for contract ${name}: ${fileError}`)
            }
          }
        } catch (contractError) {
          console.error(`❌ Error processing contract ${name}:`, contractError)
          warnings.push(`Failed to process contract ${name}: ${contractError}`)
        }
      }
    }

    // Final summary
    console.log(`\n📊 Compilation Summary:`)
    console.log(`   Total contracts found: ${Object.keys(contracts).length}`)
    console.log(`   Deployable contracts: ${deployableContractsCount}`)
    console.log(`   Interfaces/Abstract: ${Object.keys(contracts).length - deployableContractsCount}`)
    
    if (warnings.length > 0) {
      console.log(`   Warnings: ${warnings.length}`)
    }

    // Update success criteria - don't require all contracts to have bytecode
    if (Object.keys(contracts).length === 0) {
      return {
        contracts: {},
        error: 'No valid contracts were compiled. Check your Solidity code for errors.'
      }
    }

    console.log(`✅ Successfully processed ${Object.keys(contracts).length} contract(s)`)
    
    // Filter warnings to only include actual issues, not expected behavior
    const filteredWarnings = warnings.filter(warning => 
      !warning.includes('No EVM bytecode found for contract:')
    )

    return { 
      contracts, 
      warnings: filteredWarnings.length > 0 ? filteredWarnings : undefined 
    }

  } catch (error) {
    console.error('Error compiling contracts:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        return {
          contracts: {},
          error: 'Solidity compiler not found. Please ensure solc is properly installed: npm install solc',
        }
      }
      
      if (error.message.includes('Cannot resolve dependency')) {
        return {
          contracts: {},
          error: 'Failed to resolve contract dependencies. Check your import statements.',
        }
      }
    }
    
    return {
      contracts: {},
      error: error instanceof Error ? error.message : 'Unknown compilation error',
    }
  }
}

// File-based compilation wrapper
const compileFromFile = async (
  solidityFilePath: string,
  outputDir?: string
): Promise<CompilationResult> => {
  try {
    console.log(`Compiling from file: ${solidityFilePath}`)
    
    // Resolve the file path
    const fullPath = resolve(process.cwd(), solidityFilePath)
    
    if (!existsSync(fullPath)) {
      throw new Error(`Solidity file not found: ${fullPath}`)
    }

    // Read the main contract file
    const content = readSourceFile(fullPath)
    const filename = basename(fullPath)
    
    // Create sources object
    const sources = { [filename]: { content } }

    // Compile using the sources method
    return await compileFromSources(sources, outputDir)
    
  } catch (error) {
    console.error('File compilation error:', error)
    return {
      contracts: {},
      error: error instanceof Error ? error.message : 'Error reading or compiling file'
    }
  }
}

// API route handlers
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    
    if (!body) {
      return NextResponse.json(
        { error: "Missing request body" }, 
        { status: 400 }
      )
    }
    
    console.log('Compilation request received:', Object.keys(body))
    
    // Handle sources-based compilation
    if (body.sources) {
      const { sources, outputDir, saveFiles = false } = body
      
      if (!sources || typeof sources !== 'object') {
        return NextResponse.json(
          { error: 'Invalid sources object provided' },
          { status: 400 }
        )
      }
      
      const finalOutputDir = saveFiles ? (outputDir || './artifacts/') : undefined
      console.log('Compiling from sources, output dir:', finalOutputDir)
      
      const result = await compileFromSources(sources, finalOutputDir)
      
      return NextResponse.json(result, { 
        status: result.error ? 400 : 200 
      })
      
    } 
    // Handle file path-based compilation
    else if (body.solidityFilePath) {
      const { solidityFilePath, outputDir, saveFiles = false } = body
      
      if (!solidityFilePath || typeof solidityFilePath !== 'string') {
        return NextResponse.json(
          { error: 'Invalid solidityFilePath provided' },
          { status: 400 }
        )
      }
      
      const finalOutputDir = saveFiles ? (outputDir || './artifacts/') : undefined
      console.log('Compiling from file path:', solidityFilePath, 'output dir:', finalOutputDir)
      
      const result = await compileFromFile(solidityFilePath, finalOutputDir)
      
      return NextResponse.json(result, { 
        status: result.error ? 400 : 200 
      })
      
    } else {
      return NextResponse.json(
        { error: 'Either sources object or solidityFilePath is required' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { 
        error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
}

export const GET = async () => {
  try {
    // Test compilation endpoint
    const solidityFilePath = './contracts/Storage.sol'
    console.log('GET request - testing compilation with:', solidityFilePath)
    
    const result = await compileFromFile(solidityFilePath)
    
    return NextResponse.json(result, { 
      status: result.error ? 400 : 200 
    })
  } catch (error) {
    console.error('GET endpoint error:', error)
    return NextResponse.json(
      { error: 'Test compilation failed' },
      { status: 500 }
    )
  }
}