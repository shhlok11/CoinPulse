"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import toast from "react-hot-toast";
import { getCallbackUrl } from "@/lib/callback-url";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.7 1.3 9.2 3.5l6.9-6.9C36 1.8 30.4 0 24 0 14.6 0 6.4 5.4 2.5 13.2l8 6.2C12.4 13.1 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.8c-.6 3.1-2.4 5.7-5.1 7.4l7.8 6c4.6-4.2 7.2-10.4 7.2-17.1z"
    />
    <path
      fill="#34A853"
      d="M10.5 28.6c-1-2.9-1-6 0-8.9l-8-6.2C-.3 19.1-.3 29 2.5 34.6l8-6z"
    />
    <path
      fill="#FBBC05"
      d="M24 48c6.4 0 11.8-2.1 15.7-5.8l-7.8-6c-2.2 1.5-5 2.4-7.9 2.4-6.3 0-11.6-3.6-13.6-8.9l-8 6C6.4 42.6 14.6 48 24 48z"
    />
  </svg>
);

type ProviderId = "google" | "github";

const providers: Array<{ id: ProviderId; label: string }> = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" },
];

const SocialAuth = () => {
  const [isLoading, setIsLoading] = useState<ProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (provider: ProviderId) => {
    setIsLoading(provider);
    setError(null);

    try {
      window.localStorage.setItem("auth:pending", "1");
      const callbackURL = getCallbackUrl();
      const response = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, callbackURL }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Sign in failed.");
      }

      const data = (await response.json()) as { url?: string; redirect?: boolean };
      if (data?.url) {
        toast.success("Redirecting to sign in...");
        window.location.href = data.url;
        return;
      }

      throw new Error("Missing redirect URL.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed.";
      window.localStorage.removeItem("auth:pending");
      toast.error(message);
      setError(message);
      setIsLoading(null);
    }
  };

  return (
    <motion.div
      className="auth-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="auth-header">
        <div>
          <h1>Welcome back</h1>
          <p>Sign in with your Google or GitHub account to continue.</p>
        </div>
      </div>

      <div className="auth-providers">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className="auth-provider"
            onClick={() => signIn(provider.id)}
            disabled={isLoading !== null}
          >
            <span className="auth-provider-icon" aria-hidden="true">
              {provider.id === "google" ? <GoogleIcon /> : <Github />}
            </span>
            <span>{isLoading === provider.id ? "Redirecting..." : provider.label}</span>
          </button>
        ))}
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
    </motion.div>
  );
};

export default SocialAuth;
