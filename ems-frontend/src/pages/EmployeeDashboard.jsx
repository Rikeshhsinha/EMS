import { useEffect, useState } from "react";
import { Bell, CalendarCheck, CalendarDays, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import api, { endpoint } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function EmployeeDashboard() {
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
        if (active) setError(err.userMessage || "Could not load your dashboard.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading label="Preparing your dashboard..." />;

  const attendance = summary?.todayAttendance;
  const leaves = Array.isArray(summary?.recentLeaves) ? summary.recentLeaves : [];

  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-blue-600">EMPLOYEE WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome{user?.name ? `, ${user.name}` : ""}.
        </h1>
        <p className="mt-2 text-sm text-slate-500">Your attendance, leave requests, and personal updates in one place.</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><CalendarCheck size={20} /></div><h2 className="font-bold text-slate-900">Today's attendance</h2></div>
          <p className="mt-4 text-lg font-semibold capitalize text-slate-800">{attendance?.checkOut ? "Checked out" : attendance?.checkIn ? "Checked in" : "Not checked in"}</p>
          <p className="mt-1 text-sm text-slate-500">{attendance?.checkIn ? `Check-in: ${new Date(attendance.checkIn).toLocaleTimeString()}` : "Record your check-in when your workday starts."}</p>
          <Link to="/attendance" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">Open attendance →</Link>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><CalendarDays size={20} /></div><h2 className="font-bold text-slate-900">Leave requests</h2></div>
          <p className="mt-4 text-lg font-semibold text-slate-800">{leaves.length} recent request{leaves.length === 1 ? "" : "s"}</p>
          <p className="mt-1 text-sm text-slate-500">Review your applications and their current status.</p>
          <Link to="/leaves" className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700">Manage my leave →</Link>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><Bell size={20} /></div><h2 className="font-bold text-slate-900">Notifications</h2></div>
          <p className="mt-4 text-lg font-semibold text-slate-800">{summary?.unreadNotifications ?? 0} unread</p>
          <p className="mt-1 text-sm text-slate-500">Unread updates linked to your account.</p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2"><Clock3 size={18} className="text-blue-600" /><h2 className="font-bold text-slate-900">Recent leave activity</h2></div><Link to="/leaves" className="text-sm font-semibold text-blue-600">View all</Link></div>
        {leaves.length ? <div className="divide-y divide-slate-100">{leaves.map((leave) => <div key={leave._id} className="flex flex-col justify-between gap-2 p-5 sm:flex-row sm:items-center"><div><p className="font-semibold capitalize text-slate-800">{String(leave.leaveType || "other").replace(/_/g, " ")} leave</p><p className="mt-1 text-sm text-slate-500">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</p></div><span className={`self-start rounded-full px-3 py-1 text-xs font-semibold capitalize ${leave.status === "approved" ? "bg-emerald-50 text-emerald-700" : leave.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{leave.status || "pending"}</span></div>)}</div> : <EmptyState title="No recent leave requests" detail="When you apply for leave, your recent requests will appear here." />}
      </section>
    </div>
  );
}
