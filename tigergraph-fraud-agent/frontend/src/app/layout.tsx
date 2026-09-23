"use client";

import { Outfit } from "next/font/google";
import "./globals.css";
import { ShieldAlert, LayoutDashboard, Activity, FileText, Settings, ShieldCheck } from "lucide-react";
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
    <html lang="en" className="dark">
      <body className={`${outfit.className} antialiased text-slate-200 min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-gray-900 to-black`}>
        <div className="flex h-screen overflow-hidden relative">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
          
          {/* Sleek Sidebar */}
          <aside className="w-72 glass-panel flex flex-col border-r border-slate-800/50 z-10 relative">
            
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                  TigerGraph
                </h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fraud Ops Agent</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
              <NavItem href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === "/"} />
              <NavItem href="/queue" icon={<ShieldAlert size={20} />} label="Case Queue" badge="3" active={pathname === "/queue"} />
              <NavItem href="/traces" icon={<Activity size={20} />} label="Agent Traces" active={pathname === "/traces"} />
              <NavItem href="/policies" icon={<FileText size={20} />} label="Graph Policies" active={pathname === "/policies"} />
            </nav>

            {/* User Area */}
            <div className="p-4 border-t border-slate-800/50">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-sm font-semibold">AI</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Auto-Agent</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
                <Settings size={18} className="text-slate-400" />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto relative z-0">
            {/* Background ambient light */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
            
            <div className="p-8 max-w-7xl mx-auto relative z-10">
              {children}
            </div>
          </main>
          
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, active, badge }: { href: string, icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
      ${active 
        ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
    >
      <div className={`${active ? 'text-fuchsia-400' : 'text-slate-500 group-hover:text-fuchsia-400'} transition-colors duration-300`}>
        {icon}
      </div>
      <span className="font-medium flex-1">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold border border-fuchsia-500/30">
          {badge}
        </span>
      )}
    </Link>
  )
}
