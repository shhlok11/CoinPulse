import { fetcher } from '@/lib/coingecko.actions';

type SearchCoin = {
  id: string;
  name: string;
  symbol: string;
  large?: string;
  market_cap_rank?: number | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query) {
    return Response.json({ coins: [] });
  }

  try {
    const data = await fetcher<{ coins: SearchCoin[] }>('/search', { query }, 300);
    const coins = data.coins?.slice(0, 8) ?? [];
    return Response.json({ coins });
  } catch (error) {
    return Response.json({ coins: [] }, { status: 200 });
  }
}
