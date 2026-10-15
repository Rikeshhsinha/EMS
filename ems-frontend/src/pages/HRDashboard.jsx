import { useEffect, useState } from "react";
import { Activity, CalendarCheck, CalendarDays, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api, { endpoint } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

const cards = [
  { key: "totalEmployees", label: "Total employees", icon: Users, tone: "blue" },
  { key: "presentToday", label: "Present today", icon: CalendarCheck, tone: "emerald" },
  { key: "pendingLeaves", label: "Pending leave requests", icon: CalendarDays, tone: "amber" },
  { key: "departments", label: "Active departments", icon: Activity, tone: "violet" },
];

export default function HRDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get(endpoint.dashboard)
      .then(({ data }) => {
        if (active) setSummary(data.summary || data.data?.summary || {});
      })
      .catch((err) => {
        if (active) setError(err.userMessage || "Could not load HR dashboard data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading label="Preparing your HR dashboard..." />;

  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-violet-600">HR WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome{user?.name ? `, ${user.name}` : ""}.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your people, review time off, and keep track of today's attendance.
        </p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, tone }) => (
          <section key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></div>
              <span className="text-xs font-medium text-slate-400">HR overview</span>
            </div>
            <p className="mt-5 text-2xl font-bold text-slate-900">{summary?.[key] ?? "—"}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-bold text-slate-900">People operations</h2>
        <p className="mt-1 text-sm text-slate-500">Jump directly to the tasks HR handles most often.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link to="/employees" className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50">
            <p className="font-semibold text-slate-800">Employees</p>
            <p className="mt-1 text-sm text-slate-500">View and update employee records.</p>
          </Link>
          <Link to="/attendance" className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50">
            <p className="font-semibold text-slate-800">Attendance</p>
            <p className="mt-1 text-sm text-slate-500">Review today's team attendance.</p>
          </Link>
          <Link to="/leaves" className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/50">
            <p className="font-semibold text-slate-800">Leave requests</p>
            <p className="mt-1 text-sm text-slate-500">Review pending leave applications.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
