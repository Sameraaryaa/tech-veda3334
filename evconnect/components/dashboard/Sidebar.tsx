"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, Home, Battery, Calendar, DollarSign, Smartphone, Settings, LogOut, Map, Route, Car } from "lucide-react";
import { useAuthContext } from "@/lib/context/AuthContext";

interface SidebarProps {
  role: "owner" | "user";
}

const OWNER_NAV = [
  { href: "/owner-dashboard", icon: Home, label: "Overview" },
  { href: "/owner-dashboard/chargers", icon: Zap, label: "My Chargers" },
  { href: "/owner-dashboard/bookings", icon: Calendar, label: "Bookings" },
  { href: "/owner-dashboard/earnings", icon: DollarSign, label: "Earnings" },
  { href: "/owner-dashboard/nfc", icon: Smartphone, label: "NFC Setup" },
];

const USER_NAV = [
  { href: "/user-dashboard", icon: Home, label: "Overview" },
  { href: "/user-dashboard/find-chargers", icon: Map, label: "Find Chargers" },
  { href: "/user-dashboard/journey", icon: Route, label: "Journey Planner" },
  { href: "/user-dashboard/bookings", icon: Calendar, label: "My Bookings" },
  { href: "/user-dashboard/my-chargers", icon: Zap, label: "My Chargers" },
  { href: "/user-dashboard/nfc", icon: Smartphone, label: "My NFC Card" },
  { href: "/user-dashboard/vehicles", icon: Car, label: "My Vehicles" },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const nav = role === "owner" ? OWNER_NAV : USER_NAV;
  const userName = user?.displayName || "User";

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <aside className="w-[260px] min-w-[260px] h-screen fixed left-0 top-0 flex flex-col z-50 border-r" style={{ background: "rgba(5,10,20,0.9)", backdropFilter: "blur(24px)", borderColor: "rgba(0,255,136,0.1)" }}>
      {/* Logo + Profile */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(26,47,74,0.5)" }}>
        <Link href="/" className="flex items-center gap-2 no-underline mb-5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", boxShadow: "0 0 16px rgba(0,255,136,0.4)" }}>
            <Zap size={14} className="text-bg-primary" fill="#050A14" />
          </div>
          <span className="font-display font-extrabold text-lg text-white">EVConnect</span>
        </Link>
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-11 h-11 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-sm" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-text-primary font-medium text-sm">{userName}</p>
            <span className="pill pill-primary text-[9px]">{role === "owner" ? "Charger Owner" : "EV Driver"}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="no-underline">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${isActive ? "glass-active" : "hover:bg-[rgba(255,255,255,0.03)]"}`}
                style={isActive ? { borderLeft: "3px solid #00FF88" } : {}}>
                <item.icon size={18} style={{ color: isActive ? "#00FF88" : "#8BA0B4" }} />
                <span style={{ color: isActive ? "#00FF88" : "#F0F4F8" }} className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: "rgba(26,47,74,0.5)" }}>
        {role === "owner" && (
          <Link href="/admin" className="no-underline">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-text-secondary hover:text-ev-primary transition-colors cursor-pointer">
              🛡️ Admin Panel
            </div>
          </Link>
        )}
        <Link href="/user-dashboard/my-chargers" className="no-underline">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-text-secondary hover:text-ev-primary transition-colors cursor-pointer">
            ⚡ List a Charger
          </div>
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-text-secondary hover:text-ev-danger transition-colors cursor-pointer w-full">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
