'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type SearchCoin = {
  id: string;
  name: string;
  symbol: string;
  large?: string;
  market_cap_rank?: number | null;
};

const SearchModal = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchCoin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isCmdK) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = (await response.json()) as { coins?: SearchCoin[] };
        setResults(data.coins ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, open]);

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="search-dialog"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="search-header">
              <div>
                <h3>Search coins</h3>
                <p>Find markets, symbols, or IDs.</p>
              </div>
              <button type="button" className="close" onClick={close} aria-label="Close search">
                <kbd>Esc</kbd>
                <span>Close</span>
              </button>
            </div>

            <div className="search-input">
              <span className="search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search coins by name or symbol..."
              />
            </div>

            <div className="search-results">
              {isLoading ? <p className="empty">Searching...</p> : null}
              {!isLoading && !results.length && query ? (
                <p className="empty">No results found.</p>
              ) : null}

              {results.map((coin) => (
                <Link
                  key={coin.id}
                  href={`/coins/${coin.id}`}
                  className="search-item"
                  onClick={close}
                >
                  <div className="coin-info">
                    {coin.large ? (
                      <Image src={coin.large} alt={coin.name} width={36} height={36} />
                    ) : (
                      <div className="coin-fallback" />
                    )}
                    <div>
                      <p>{coin.name}</p>
                      <span className="coin-symbol">{coin.symbol?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="coin-rank">
                    {coin.market_cap_rank ? `#${coin.market_cap_rank}` : '—'}
                  </div>
                </Link>
                ))}
              </div>

              <div className="search-footer">
                <div className="hint">
                  <kbd>Enter</kbd>
                  <span>Open</span>
                </div>
                <div className="hint">
                  <kbd>Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
    </AnimatePresence>
  );

  return (
    <div id="search-modal">
      <button type="button" className="trigger" onClick={() => setOpen(true)}>
        Search
        <span className="kbd">⌘ K</span>
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </div>
  );
};

export default SearchModal;
