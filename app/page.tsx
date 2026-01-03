import MotionSection from '@/components/MotionSection';
import Link from 'next/link';

const page = () => {
  return (
    <main className="main-container">
      <MotionSection className="space-y-4" delay={0.05}>
        <p className="badge badge-up">Live market pulse</p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-white">
          CoinPulse Dashboard
        </h1>
        <p className="max-w-2xl text-purple-100">
          Track price shifts, market caps, and coin momentum in one terminal-like
          view. Use search to jump to any asset instantly.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="auth-provider" href="/coins">
            Explore all coins
          </Link>
          <Link className="auth-link" href="/coins/bitcoin">
            View Bitcoin
          </Link>
        </div>
      </MotionSection>
    </main>
  );
};

export default page
