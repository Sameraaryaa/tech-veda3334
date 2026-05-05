"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Home, Car } from "lucide-react";

const TESTIMONIALS = [
  { text: "Listed my home charger — earning ₹3,200/month now!", author: "Priya N., Bangalore" },
  { text: "Found a charger 2km from my office. Life saver.", author: "Vikram S., Mumbai" },
  { text: "NFC tap-to-charge is magic. No app fumbling.", author: "Ananya R., Delhi" },
];

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"user" | "owner">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    if (role === "owner") router.push("/owner-dashboard");
    else router.push("/user-dashboard");
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (role === "owner") router.push("/owner-dashboard");
    else router.push("/user-dashboard");
  };

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
              <button key={t} className="flex-1 py-2.5 rounded-full text-sm font-display font-bold transition-all" style={{ background: tab === t ? "linear-gradient(135deg, #00FF88, #00CC6A)" : "transparent", color: tab === t ? "#050A14" : "#8BA0B4" }} onClick={() => setTab(t)}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <h2 className="font-display font-extrabold text-2xl text-white mb-6">{tab === "signin" ? "Welcome back" : "Join EVConnect"}</h2>

          {/* Role Selector (signup only) */}
          {tab === "signup" && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { r: "user" as const, icon: Car, title: "I want to CHARGE", desc: "Find chargers, plan routes" },
                { r: "owner" as const, icon: Home, title: "I want to EARN", desc: "List charger, earn income" },
              ]).map(opt => (
                <button key={opt.r} className={`glass p-4 text-left transition-all rounded-xl ${role === opt.r ? "glass-active" : "glass-hover"}`} style={role === opt.r ? { transform: "scale(1.02)" } : {}} onClick={() => setRole(opt.r)}>
                  <opt.icon size={20} style={{ color: role === opt.r ? "#00FF88" : "#8BA0B4" }} className="mb-2" />
                  <p className="font-display font-bold text-xs text-text-primary">{opt.title}</p>
                  <p className="text-text-secondary text-[10px] mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer" style={{ background: "white", color: "#333" }} onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
            <span className="text-text-secondary text-xs">or</span>
            <div className="flex-1 h-px" style={{ background: "var(--bg-border)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "signup" && <input className="input-glass" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />}
            <input className="input-glass" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="relative">
              <input className="input-glass !pr-10" type={showPwd ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {tab === "signin" && <p className="text-right"><a className="text-xs text-ev-primary cursor-pointer hover:underline">Forgot password?</a></p>}
            <button className="btn-primary w-full py-3.5 text-sm" type="submit" disabled={loading}>
              {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
