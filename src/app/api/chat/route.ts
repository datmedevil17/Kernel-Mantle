import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    const systemContext = `You are the AI Assistant for Neuron AI (formerly Kernel Morph), a comprehensive Web3 development platform on the Mantle Network.

Platform Features:
1. Pipeline Builder: Visual node-based smart contract builder. Drag & drop nodes (Storage, Events, Access Control) to create contracts without coding.
2. Natural Language Interface (NLP): "Smart Contract Interface" page where users type commands like "Transfer 100 tokens" and you convert them to transactions.
3. IDE: Full-fledged Solidity editor in the browser with compilation and deployment to Mantle Sepolia/Mainnet.
4. Security Audit: Real-time AI vulnerability scanning for smart contracts.
5. Dashboard: Analytics and transaction tracking.

Your Role:
- Help users build, deploy, and debug smart contracts.
- Explain platform features (Pipeline, NLP, IDE).
- Assist with Mantle Network specific questions (Sepolia testnet, Mainnet).
- Be concise, technical but accessible.

Current User Question: "${question}"`;

    const response = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        contents: [
          {
            parts: [{ text: systemContext }],
          },
        ],
      },
    });

    return NextResponse.json({ 
      response: response.data.candidates[0].content.parts[0].text 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}