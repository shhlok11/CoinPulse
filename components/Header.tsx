'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import SearchModal from '@/components/SearchModal';
import MotionSection from '@/components/MotionSection';
import Image from 'next/image';
import toast from 'react-hot-toast';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/get-session', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          if (!cancelled) setHasSession(false);
          return;
        }

        const data = (await response.json().catch(() => null)) as
          | { session?: unknown }
          | null;
        if (!cancelled) {
          const sessionActive = !!data?.session;
          setHasSession(sessionActive);
          if (sessionActive) {
            const pendingLogin = window.localStorage.getItem('auth:pending');
            if (pendingLogin) {
              toast.success('Logged in successfully.');
              window.localStorage.removeItem('auth:pending');
            }
          }
        }
      } catch {
        if (!cancelled) setHasSession(false);
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error('Sign out failed');
      }
      toast.success('Signed out.');
      window.localStorage.removeItem('auth:pending');
    } catch (error) {
      toast.error('Unable to sign out. Try again.');
    } finally {
      setHasSession(false);
      setIsSigningOut(false);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header>
      <MotionSection className="main-container inner" delay={0.05}>
        <Link href="/">
          <Image
            src="/assets/logo.svg"
            alt="CoinPulse logo"
            width={132}
            height={40}
            className="logo"
            loading="eager"
          />
        </Link>

        <nav>
          <Link
            href="/"
            className={cn('nav-link', {
              'is-active': pathname === '/',
              'is-home': true,
            })}
          >
            Home
          </Link>

          <SearchModal />

          <Link
            href="/coins"
            className={cn('nav-link', {
              'is-active': pathname === '/coins',
            })}
          >
            All Coins
          </Link>

          {hasSession === null ? null : hasSession ? (
            <button
              type="button"
              className="nav-link"
              onClick={signOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
          ) : (
            <Link href="/login" className="nav-link">
              Login
            </Link>
          )}
        </nav>
      </MotionSection>
    </header>
  );
};

export default Header;
