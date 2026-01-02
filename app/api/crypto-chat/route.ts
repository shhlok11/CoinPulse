import { NextRequest } from 'next/server';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_BASE_URL =
  process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as
    | { message?: string; history?: ChatMessage[] }
    | null;

  const message = body?.message?.trim();
  if (!message) {
    return Response.json({ error: 'Message is required' }, { status: 400 });
  }

  const history = Array.isArray(body?.history) ? body?.history.slice(-6) : [];
  const historyText = history
    .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
    .join('\n');

  const prompt = [
    'You are a helpful crypto assistant.',
    'Answer concisely, avoid direct buy/sell instructions, and cite general risks when relevant.',
    'When the user asks about whether an investment is safe to buy, provide a short, well-formatted risk assessment:',
    '- Use this Markdown template exactly:',
    '  Safety: <Relatively safer | Moderate risk | High risk>',
    '  Reasons:',
    '  - <reason 1>',
    '  - <reason 2>',
    '  - <optional reason 3>',
    '  Note: This is not financial advice.',
    '- Keep reasons concise and grounded in volatility, liquidity, regulatory risk, or project fundamentals.',
    'If unsure, say you do not know.',
    historyText ? `Conversation so far:\n${historyText}` : '',
    `User: ${message}`,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch(
    `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.4,
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    return Response.json(
      {
        error: 'Gemini request failed',
        status: response.status,
        details: errorText,
        model: GEMINI_MODEL,
      },
      { status: 502 },
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      }
    | null;

  const reply = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!reply) {
    return Response.json({ error: 'Empty response' }, { status: 502 });
  }

  return Response.json({ reply });
}
