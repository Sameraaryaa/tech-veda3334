"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Home, Car, AlertCircle } from "lucide-react";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  getUserProfile,
} from "@/lib/firebase";
import { useAuth } from "@/lib/hooks/useAuth";

const TESTIMONIALS = [
  { text: "Listed my home charger — earning ₹3,200/month now!", author: "Priya N., Bangalore" },
  { text: "Found a charger 2km from my office. Life saver.", author: "Vikram S., Mumbai" },
  { text: "NFC tap-to-charge is magic. No app fumbling.", author: "Ananya R., Delhi" },
];

export default function AuthPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"user" | "owner">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "owner") router.push("/owner-dashboard");
      else router.push("/user-dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const fbUser = await signInWithGoogle(role);
      // Check if user has a profile already → determine role
      const profile = await getUserProfile(fbUser.uid);
      const userRole = profile?.role || role;
      if (userRole === "owner") router.push("/owner-dashboard");
      else router.push("/user-dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      // Friendly error messages
      if (msg.includes("popup-closed")) {
        setError("Sign-in popup was closed. Please try again.");
      } else if (msg.includes("network")) {
        setError("Network error. Check your internet connection.");
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === "signup") {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
        await signUpWithEmail(email, password, name, role);
        if (role === "owner") router.push("/owner-dashboard");
        else router.push("/user-dashboard");
      } else {
        const fbUser = await signInWithEmail(email, password);
        const profile = await getUserProfile(fbUser.uid);
        const userRole = profile?.role || "user";
        if (userRole === "owner") router.push("/owner-dashboard");
        else router.push("/user-dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      if (msg.includes("user-not-found") || msg.includes("invalid-credential")) {
        setError("Invalid email or password. Please try again.");
      } else if (msg.includes("wrong-password")) {
        setError("Incorrect password. Please try again.");
      } else if (msg.includes("email-already-in-use")) {
        setError("This email is already registered. Try signing in instead.");
      } else if (msg.includes("weak-password")) {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", animation: "pulse-glow 2s infinite" }}>
            <Zap size={32} fill="#050A14" className="text-bg-primary" />
          </div>
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(0,255,136,0.12) 0%, transparent 60%), var(--bg-primary)" }} />
        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", boxShadow: "0 0 30px rgba(0,255,136,0.4)" }}>
              <Zap size={24} fill="#050A14" className="text-bg-primary" />
            </div>
            <span className="font-display font-extrabold text-4xl text-white">EVConnect</span>
          </div>
          <p className="text-text-secondary text-xl mb-12">Charge smarter. Earn more.</p>

          {/* Testimonial */}
          <div className="glass p-6 rounded-2xl mb-8 min-h-[120px] flex flex-col justify-center" style={{ transition: "opacity 0.5s" }}>
            <p className="text-text-primary text-sm italic mb-2">&ldquo;{TESTIMONIALS[testimonialIdx].text}&rdquo;</p>
            <p className="text-ev-primary text-xs font-medium">— {TESTIMONIALS[testimonialIdx].author}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[{ v: "2,400+", l: "Chargers" }, { v: "18", l: "Cities" }, { v: "₹4.50", l: "avg/kWh" }].map(s => (
              <div key={s.l} className="glass p-3 rounded-xl text-center">
                <p className="font-mono text-sm text-ev-primary font-bold">{s.v}</p>
                <p className="text-text-secondary text-[10px]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "var(--bg-primary)" }}>
        <div className="glass rounded-3xl p-8 md:p-10 w-full max-w-md" style={{ borderColor: "rgba(0,255,136,0.15)" }}>
          {/* Tab Toggle */}
          <div className="flex rounded-full p-1 mb-8" style={{ background: "var(--bg-border)" }}>
            {(["signin", "signup"] as const).map(t => (
              <button key={t} className="flex-1 py-2.5 rounded-full text-sm font-display font-bold transition-all cursor-pointer" style={{ background: tab === t ? "linear-gradient(135deg, #00FF88, #00CC6A)" : "transparent", color: tab === t ? "#050A14" : "#8BA0B4" }} onClick={() => { setTab(t); setError(null); }}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <h2 className="font-display font-extrabold text-2xl text-white mb-6">{tab === "signin" ? "Welcome back" : "Join EVConnect"}</h2>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertCircle size={16} className="text-ev-danger flex-shrink-0" />
              <p className="text-ev-danger text-xs">{error}</p>
            </div>
          )}

          {/* Role Selector (signup only) */}
          {tab === "signup" && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { r: "user" as const, icon: Car, title: "I want to CHARGE", desc: "Find chargers, plan routes" },
                { r: "owner" as const, icon: Home, title: "I want to EARN", desc: "List charger, earn income" },
              ]).map(opt => (
                <button key={opt.r} className={`glass p-4 text-left transition-all rounded-xl cursor-pointer ${role === opt.r ? "glass-active" : "glass-hover"}`} style={role === opt.r ? { transform: "scale(1.02)" } : {}} onClick={() => setRole(opt.r)}>
                  <opt.icon size={20} style={{ color: role === opt.r ? "#00FF88" : "#8BA0B4" }} className="mb-2" />
                  <p className="font-display font-bold text-xs text-text-primary">{opt.title}</p>
                  <p className="text-text-secondary text-[10px] mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Google Auth */}
          <button
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer hover:shadow-lg"
            style={{ background: "white", color: "#333" }}
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
            <span className="text-text-secondary text-xs">or</span>
            <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "signup" && (
              <input className="input-glass" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
            )}
            <input className="input-glass" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            <div className="relative">
              <input className="input-glass !pr-10" type={showPwd ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={tab === "signin" ? "current-password" : "new-password"} minLength={6} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {tab === "signin" && <p className="text-right"><a className="text-xs text-ev-primary cursor-pointer hover:underline">Forgot password?</a></p>}
            <button className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2" type="submit" disabled={loading}>
              {loading && <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" />}
              {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Switch tab hint */}
          <p className="text-text-secondary text-xs text-center mt-6">
            {tab === "signin" ? (
              <>Don&apos;t have an account? <button className="text-ev-primary cursor-pointer hover:underline" onClick={() => { setTab("signup"); setError(null); }}>Sign up</button></>
            ) : (
              <>Already have an account? <button className="text-ev-primary cursor-pointer hover:underline" onClick={() => { setTab("signin"); setError(null); }}>Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
