"use client";

import { Outfit } from "next/font/google";
import "./globals.css";
import { ShieldAlert, LayoutDashboard, Activity, FileText, Settings, Fingerprint } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <html lang="en" className="light">
      <body className={`${outfit.className} antialiased text-slate-900 min-h-screen bg-slate-50`}>
        <div className="flex flex-col min-h-screen">
          
          {/* Top Navigation Bar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <Fingerprint size={24} />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg leading-tight text-slate-900">TigerGraph</h1>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Fraud Ops Agent</p>
                  </div>
                </div>

                {/* Main Nav */}
                <nav className="hidden md:flex gap-1">
                  <TopNavItem href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === "/"} />
                  <TopNavItem href="/queue" icon={<ShieldAlert size={18} />} label="Queue" badge="3" active={pathname === "/queue"} />
                  <TopNavItem href="/traces" icon={<Activity size={18} />} label="Traces" active={pathname === "/traces"} />
                  <TopNavItem href="/policies" icon={<FileText size={18} />} label="Policies" active={pathname === "/policies"} />
                </nav>

                {/* User Area */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-slate-600">Auto-Agent Online</span>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function TopNavItem({ href, icon, label, active, badge }: { href: string, icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
      ${active 
        ? 'bg-slate-100 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      <div className={`${active ? 'text-indigo-600' : 'text-slate-400'} transition-colors`}>
        {icon}
      </div>
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 ml-1">
          {badge}
        </span>
      )}
    </Link>
  )
}
