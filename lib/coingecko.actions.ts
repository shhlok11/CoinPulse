'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

const responseCache = new Map<string, { timestamp: number; data: unknown }>();

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const normalizedEndpoint = endpoint.replace(/^\/+/, '');
  const isProApi = BASE_URL.includes('pro-api.coingecko.com');

  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${normalizedEndpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const cached = responseCache.get(url);
  const cacheTtlMs = revalidate * 1000;
  if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
    return cached.data as T;
  }

  const requestHeaders = {
    ...(isProApi ? { 'x-cg-pro-api-key': API_KEY } : { 'x-cg-demo-api-key': API_KEY }),
    'Content-Type': 'application/json',
  } as Record<string, string>;

  const maxRetries = 2;
  const timeoutMs = 15000;

  const fetchWithRetry = async (attempt = 0): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        headers: requestHeaders,
        next: { revalidate },
        signal: controller.signal,
      });
    } catch (error) {
      if (attempt < maxRetries) {
        const backoffMs = 500 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        return fetchWithRetry(attempt + 1);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const response = await fetchWithRetry();

  if (!response.ok) {
    if (response.status === 429 && cached) {
      return cached.data as T;
    }
    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));

    throw new Error(`API Error: ${response.status}: ${errorBody.error || response.statusText} `);
  }

  const data = await response.json();
  responseCache.set(url, { timestamp: Date.now(), data });
  return data;
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>('/onchain/search/pools', { query: id });

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}
