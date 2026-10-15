import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Employees", path: "/employees", icon: Users },
  { label: "Departments", path: "/departments", icon: Building2 },
  { label: "Attendance", path: "/attendance", icon: CalendarCheck },
  { label: "Leave requests", path: "/leaves", icon: CalendarDays },
  { label: "Holidays", path: "/holidays", icon: Bell },
  { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "User";
  const role = String(user?.role || "").toLowerCase();
  const visibleNavItems = navItems.filter((item) => {
    if (role === "employee")
      return ["/", "/attendance", "/leaves", "/holidays"].includes(item.path);
    if (role === "hr") return true;
    if (role === "admin") return true;
    return false;
  });

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  const sidebar = (
    <aside
      className={`flex h-full flex-col bg-[#101a31] text-slate-300 ${collapsed ? "w-[86px]" : "w-[260px]"} transition-[width] duration-200`}
    >
      <div
        className={`flex h-[82px] items-center border-b border-white/10 px-5 ${collapsed ? "justify-center" : ""}`}
      >
        <Logo compact={collapsed} />
      </div>
      <div className="px-4 pt-6">
        <p
          className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 ${collapsed ? "text-center" : ""}`}
        >
          {collapsed ? "MENU" : "Workspace"}
        </p>
        <nav className="space-y-1">
          {visibleNavItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"} ${collapsed ? "justify-center" : ""}`
              }
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div
          className={`rounded-xl border border-white/10 bg-white/[0.04] p-3 ${collapsed ? "flex justify-center" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-200">
              {name.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{name}</p>
                <p className="mt-0.5 text-[10px] capitalize text-slate-400">{role || "unknown role"}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={signOut}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      </div>
      {!collapsed && (
        <button
          onClick={() => setCollapsed(true)}
          className="hidden h-11 items-center justify-center gap-2 border-t border-white/10 text-xs text-slate-500 hover:text-white lg:flex"
        >
          <ChevronLeft size={15} /> Collapse sidebar
        </button>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] lg:flex">
      <div className="fixed inset-x-0 top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600">
          <Menu />
        </button>
        <Logo />
        <div className="w-9" />
      </div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{sidebar}</div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative h-full w-[280px]">
            {sidebar}
            <button onClick={() => setSidebarOpen(false)} className="absolute right-3 top-6 rounded-lg p-2 text-slate-300">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      <main
        className={`min-w-0 flex-1 pt-[68px] transition-[margin] duration-200 lg:pt-0 ${collapsed ? "lg:ml-[86px]" : "lg:ml-[260px]"}`}
      >
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="fixed bottom-6 left-[68px] z-20 hidden rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow lg:block"
          >
            <ChevronRight size={16} />
          </button>
        )}
        <header className="hidden h-[82px] items-center justify-between border-b border-slate-200/80 bg-white px-8 lg:flex">
          <div>
            <p className="text-xs text-slate-400">Workspace / <span className="text-slate-600">People operations</span></p>
            <p className="mt-1 text-sm font-semibold text-slate-800">A clearer view of your team.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{name}</p>
              <p className="mt-0.5 text-xs capitalize text-slate-400">{role || "unknown role"}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
