'use server';

type NewsItem = {
  title: string;
  url: string;
  source?: string;
  publishedAt?: string;
};

type AiInsights = {
  news: NewsItem[];
};

const NEWS_BASE_URL = process.env.NEWS_API_BASE_URL || 'https://gnews.io/api/v4/search';
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const insightsCache = new Map<string, { timestamp: number; data: AiInsights }>();

const fetchNews = async (query: string, revalidate = 900): Promise<NewsItem[]> => {
  if (!NEWS_API_KEY) return [];

  const url = new URL(NEWS_BASE_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('lang', 'en');
  url.searchParams.set('max', '6');
  url.searchParams.set('token', NEWS_API_KEY);

  const response = await fetch(url.toString(), { next: { revalidate } });
  if (!response.ok) return [];

  const data = (await response.json().catch(() => null)) as {
    articles?: Array<{
      title?: string;
      url?: string;
      source?: { name?: string };
      publishedAt?: string;
    }>;
  } | null;

  return (
    data?.articles
      ?.filter((article) => article.title && article.url)
      .map((article) => ({
        title: article.title || '',
        url: article.url || '',
        source: article.source?.name,
        publishedAt: article.publishedAt,
      })) || []
  );
};

export const getAiInsights = async (coinName: string, symbol: string): Promise<AiInsights> => {
  const cacheKey = `${coinName}:${symbol}`.toLowerCase();
  const cached = insightsCache.get(cacheKey);
  const cacheTtlMs = 15 * 60 * 1000;

  if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
    return cached.data;
  }

  const news = await fetchNews(`${coinName} OR ${symbol}`);
  const insights = { news };

  insightsCache.set(cacheKey, { timestamp: Date.now(), data: insights });
  return insights;
};
