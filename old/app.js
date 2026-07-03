import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Calculator, Users, Settings, FileText, Tag } from "lucide-react";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Rates from "./pages/Rates";
import PdfPreview from "./pages/PdfPreview";

const nav = [
  { to: "/", label: "Calculator", icon: Calculator },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/rates", label: "Rate Cards", icon: FileText },
];

export default function App() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/pdf-preview");

  if (hideNav) {
    return (
      <Routes>
        <Route path="/pdf-preview/:customerId" element={<PdfPreview />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint-400 to-emerald-500 flex items-center justify-center shadow-sm">
            <Tag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">
              Q Labels
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              Satin Labels
            </p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-mint-50 text-mint-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 text-gray-400 text-xs">
            <Settings className="w-4 h-4" />
            <span>Rate Calculator v1.0</span>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/rates" element={<Rates />} />
        </Routes>
      </main>
    </div>
  );
}
