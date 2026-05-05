"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Wifi, Menu, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Navbar V2 — Glassmorphism Android-style top bar
   Fixed, blurred, with NFC "Tap to Charge" button
   ═══════════════════════════════════════════════════════════ */

interface NavbarProps {
  activePath?: string;
  onNFCClick?: () => void;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Find Charger" },
  { href: "/list-charger", label: "List Charger" },
];

export default function Navbar({ activePath, onNFCClick }: NavbarProps) {
  const pathname = usePathname();
  const currentPath = activePath || pathname;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 transition-all duration-300"
        style={{
          height: "64px",
          background: "rgba(5,10,20,0.7)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: `1px solid rgba(0,255,136,${scrolled ? "0.15" : "0.08"})`,
        }}
      >
        {/* LEFT — Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00FF88, #00CC6A)",
              boxShadow: "0 0 20px rgba(0,255,136,0.4)",
            }}
          >
            <Zap size={16} className="text-bg-primary" fill="#050A14" />
          </div>
          <span className="font-display font-extrabold text-xl text-white">
            EVConnect
          </span>
        </Link>

        {/* CENTER — Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative no-underline text-sm font-medium transition-colors duration-200 group"
                style={{ color: isActive ? "#00FF88" : "#8BA0B4" }}
              >
                <span className={isActive ? "glow-text-green" : ""}>
                  {link.label}
                </span>
                {/* Underline animation */}
                <span
                  className="absolute -bottom-1 left-0 h-[2px] transition-all duration-300"
                  style={{
                    width: isActive ? "100%" : "0%",
                    background: "#00FF88",
                  }}
                />
                {!isActive && (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 bg-ev-primary/50" />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT — NFC + Auth */}
        <div className="flex items-center gap-3">
          {/* NFC Button */}
          <button
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: "rgba(0,255,136,0.1)",
              border: "1px solid rgba(0,255,136,0.3)",
              color: "#00FF88",
            }}
            onClick={onNFCClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0,255,136,0.3)";
              e.currentTarget.style.borderColor = "#00FF88";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(0,255,136,0.3)";
            }}
            id="nfc-nav-btn"
          >
            <Wifi size={14} />
            Tap to Charge
          </button>

          {/* Sign In (desktop) */}
          <button
            className="hidden md:flex btn-ghost text-xs px-4 py-2"
            id="auth-btn"
          >
            Sign In
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X size={22} className="text-text-primary" />
            ) : (
              <Menu size={22} className="text-text-primary" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[99] pt-16"
          style={{
            background: "rgba(5,10,20,0.95)",
            backdropFilter: "blur(20px)",
            animation: "slide-up 0.3s var(--spring)",
          }}
        >
          <div className="flex flex-col items-center gap-6 pt-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline text-lg font-display font-bold"
                style={{
                  color: currentPath === link.href ? "#00FF88" : "#8BA0B4",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm"
              style={{
                background: "rgba(0,255,136,0.1)",
                border: "1px solid rgba(0,255,136,0.3)",
                color: "#00FF88",
              }}
              onClick={() => { onNFCClick?.(); setMobileOpen(false); }}
            >
              <Wifi size={16} />
              Tap to Charge
            </button>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div style={{ height: "64px" }} />
    </>
  );
}
