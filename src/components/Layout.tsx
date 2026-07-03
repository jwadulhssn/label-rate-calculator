import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { Calculator, Users, Tags, Menu, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Calculator", icon: Calculator },
  { to: "/customers", label: "Customers", icon: Users },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebar = (
    <>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Tags className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            LabelPro
          </h1>
          <p className="text-xs text-slate-500">Rate Calculator</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === to
                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800/50">
        <p className="text-xs text-slate-600 text-center">LabelPro v1.0</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Tags className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            LabelPro
          </span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-300"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 p-6 flex-col z-50">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 p-6 flex flex-col shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
