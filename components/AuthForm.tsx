"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getCallbackUrl } from "@/lib/callback-url";

type Mode = "sign-in" | "sign-up";

const AuthForm = () => {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      const payload =
        mode === "sign-up"
          ? { email, password, name }
          : { email, password };

      const callbackURL = getCallbackUrl();
      const response = await fetch(`/api/auth/${mode === "sign-up" ? "sign-up" : "sign-in"}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, callbackURL }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Authentication failed.");
      }

      if (mode === "sign-up") {
        setMode("sign-in");
        setName("");
        setPassword("");
        setNotice("Account created. Check your email to verify, then sign in.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    setError(null);
    setNotice(null);

    try {
      const callbackURL = getCallbackUrl();
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackURL }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || "Failed to send verification email.");
      }

      setNotice("Verification email sent. Check your inbox.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send verification email.";
      setError(message);
    } finally {
      setIsResending(false);
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
          <h1>{mode === "sign-up" ? "Create account" : "Welcome back"}</h1>
          <p>
            {mode === "sign-up"
              ? "Start tracking coins with a personalized dashboard."
              : "Log in to continue your crypto watchlist."}
          </p>
        </div>
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "sign-in" ? "active" : ""}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "sign-up" ? "active" : ""}
            onClick={() => setMode("sign-up")}
          >
            Sign up
          </button>
        </div>
      </div>

      <form onSubmit={submit}>
        {mode === "sign-up" ? (
          <label>
            Name
            <input
              type="text"
              placeholder="Satoshi Nakamoto"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        ) : null}

        <label>
          Email
          <input
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {notice ? <p className="auth-note">{notice}</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}
        {mode === "sign-in" ? (
          <button type="button" className="auth-link" onClick={resendVerification} disabled={isResending}>
            {isResending
              ? "Sending verification email..."
              : email
                ? "Resend verification email"
                : "Enter your email to resend verification"}
          </button>
        ) : null}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Please wait..." : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>
    </motion.div>
  );
};

export default AuthForm;
