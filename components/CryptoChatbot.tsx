'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const CryptoChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Ask me anything about crypto, markets, or specific tokens.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crypto-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: nextMessages }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string; status?: number; details?: string }
          | null;
        const detail = errorPayload?.details ? ` ${errorPayload.details}` : '';
        throw new Error(`${errorPayload?.error || 'Failed to fetch response'}${detail}`);
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();
      if (!reply) {
        throw new Error('No reply');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to get a response right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <section className="crypto-chatbot">
      <div className="chat-header">
        <div>
          <h4>Crypto AI Chat</h4>
          <p className="subtitle">Ask about trends, tokens, or market basics.</p>
        </div>
        <span className="badge">Gemini</span>
      </div>

      <div className="chat-window">
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.role}`}>
            {message.content}
          </div>
        ))}
        {isLoading ? <div className="chat-bubble assistant">Thinking…</div> : null}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask about BTC, ETH, narratives, or risk factors..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>

      {error ? <p className="chat-error">{error}</p> : null}
    </section>
  );
};

export default CryptoChatbot;
