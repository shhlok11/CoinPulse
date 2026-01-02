const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE_URL =
  process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1';

export const runtime = 'nodejs';

export async function GET() {
  if (!GEMINI_API_KEY) {
    return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  const response = await fetch(`${GEMINI_API_BASE_URL}/models?key=${GEMINI_API_KEY}`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    return Response.json(
      { error: 'Gemini listModels failed', status: response.status, details: errorText },
      { status: 502 },
    );
  }

  const payload = await response.json().catch(() => null);
  return Response.json(payload ?? { models: [] });
}
