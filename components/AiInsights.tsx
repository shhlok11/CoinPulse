import { getAiInsights } from '@/lib/ai-insights';

type AiInsightsProps = {
  name: string;
  symbol: string;
};

const AiInsights = async ({ name, symbol }: AiInsightsProps) => {
  try {
    const { news } = await getAiInsights(name, symbol);

    return (
      <section className="ai-insights">
        <div className="section-header">
          <div>
            <h4>AI Insights</h4>
            <p className="subtitle">News-driven pros and cons for this asset.</p>
          </div>
          <span className="badge">Beta</span>
        </div>

        {news.length ? (
          <div className="news">
            <p className="label">Latest news</p>
            <ul>
              {news.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                  {item.source ? <span className="source"> {item.source}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm opacity-60">No recent news available.</p>
        )}

      </section>
    );
  } catch (error) {
    console.error('AI Insights error:', error);
    return (
      <section className="ai-insights">
        <h4>AI Insights</h4>
        <p className="text-sm opacity-60">Insights are temporarily unavailable.</p>
      </section>
    );
  }
};

export default AiInsights;
