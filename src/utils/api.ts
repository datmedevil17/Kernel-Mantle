import axios from 'axios';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function makeGeminiRequest(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured. Please add it to your .env.local file.');
  }

  try {
    const response = await axios({
      url: `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    const text = response.data.candidates[0].content.parts[0].text;
    console.log(text)
    try {
      const cleanString = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanString);
    } catch {
      // If JSON parsing fails, return the text as content
      const cleanCode = text
        .replace(/```solidity|```/g, "")
        .replace(/```/g, "")
        .trim();
      
      return {
        content: cleanCode,
        success: true
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function querySecurityAudit(code: string, language: string) {
  const prompt = `Analyze this ${language} code for security vulnerabilities. Be concise. Return ONLY a JSON array (max 5 issues).

Each issue must have:
- id: "SEC-1", "SEC-2", etc.
- severity: "critical"|"high"|"medium"|"low"
- title: Brief title (max 10 words)
- description: One sentence description
- lineNumber: number or null
- recommendation: One sentence fix
- category: "Reentrancy"|"Access Control"|"Overflow"|"Logic"|"Other"

Code:
${code.slice(0, 3000)}`;

  return makeGeminiRequest(prompt);
}

export async function queryCodeSuggestions(code: string, language: string) {
  const prompt = `Suggest improvements for this ${language} code. Be concise. Return ONLY a JSON array (max 5 suggestions).

Each suggestion must have:
- id: "SUG-1", "SUG-2", etc.
- type: "optimization"|"best-practice"|"security"|"maintainability"
- title: Brief title (max 10 words)
- description: One sentence description
- codeExample: Short code snippet or empty string
- impact: "high"|"medium"|"low"

Code:
${code.slice(0, 3000)}`;

  return makeGeminiRequest(prompt);
}

export async function queryCodeAnalytics(code: string, language: string) {
  const gasField = language === 'solidity' 
    ? ',"gasOptimization":{"estimatedGas":number,"optimizationPotential":number,"suggestions":["string","string"]}' 
    : '';
  
  const prompt = `Analyze this ${language} code metrics. Return ONLY this JSON structure:
{
  "complexity":{"cyclomatic":number,"cognitive":number,"score":"excellent|good|moderate|complex"},
  "codeQuality":{"maintainability":number,"readability":number,"testability":number},
  "metrics":{"linesOfCode":number,"functions":number,"variables":number,"comments":number,"commentRatio":number}${gasField}
}

Code:
${code.slice(0, 3000)}`;

  return makeGeminiRequest(prompt);
}