"use client";

import { useState, useEffect } from "react";
import { register, login } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { setUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignUp) {
        const response = await register(email, password, fullName);
        console.log("Registration response:", response);

        if (
          response.user &&
          response.message === "User registered successfully"
        ) {
          // Registration successful but no session (email confirmation needed)
          setMessage(
            "✅ Registration successful! Please check your email and click the confirmation link before logging in."
          );
          // Clear form for next step
          setEmail("");
          setPassword("");
          setFullName("");
          // Don't call onSuccess yet - user needs to confirm email
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        const response = await login(email, password);

        if (response.user && response.session) {
          // The API client now handles storing auth data in cookies
          // Just update the user state
          setUser(response.user);

          // Clear form
          setEmail("");
          setPassword("");

          // Redirect to dashboard
          router.push("/");
        } else if (response.user && !response.session) {
          setError(
            "Email not confirmed. Please check your email and click the confirmation link before logging in."
          );
        } else {
          setError("Login failed. Please check your credentials.");
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      // Handle specific Supabase error messages
      if (errorMessage.includes("For security purposes")) {
        setError("Too many attempts. Please wait before trying again.");
      } else if (errorMessage.includes("already registered")) {
        setError("Email already registered. Please login instead.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-100">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-slate-200 text-sm font-semibold mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="block text-slate-200 text-sm font-semibold mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-200 text-sm font-semibold mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-800 disabled:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"}
          </button>

          {isSignUp && (
            <div className="mt-3 text-xs text-slate-400">
              <p>
                After registration, check your email for a confirmation link.
              </p>
              <p>
                You&apos;ll need to confirm your email before you can log in.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
