import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Clock3, RefreshCw } from "lucide-react";
import api, { endpoint } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

function rowsFrom(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}
function localDateValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}
function dateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}
function duration(record) {
  if (!record.checkIn || !record.checkOut) return record.checkIn ? "In progress" : "—";
  const minutes = Math.max(0, Math.round((new Date(record.checkOut) - new Date(record.checkIn)) / 60000));
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
function badge(status) {
  return String(status || "unknown").replace(/_/g, " ");
}

export default function Attendance() {
  const { user } = useAuth();
  const canManage = ["admin", "hr"].includes(user?.role);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [workLocation, setWorkLocation] = useState("office");
  const [filters, setFilters] = useState({ from: "", to: "", status: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = canManage ? Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) : {};
      const { data } = await api.get(canManage ? endpoint.attendance : `${endpoint.attendance}/me`, { params });
      setRecords(rowsFrom(data));
    } catch (err) {
      setError(err.userMessage || "Could not load attendance records.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [canManage, filters]);

  useEffect(() => { load(); }, [load]);

  const today = localDateValue();
  const todayRecord = records.find((record) => record.date === today);
  const checkedIn = Boolean(todayRecord?.checkIn);
  const checkedOut = Boolean(todayRecord?.checkOut);

  const runAction = async (action) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await action();
      setNotice(response.data?.message || "Attendance updated.");
      await load();
    } catch (err) {
      setError(err.userMessage || "Could not update attendance.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">TIME & ATTENDANCE</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Attendance</h1>
          <p className="mt-2 text-sm text-slate-500">{canManage ? "Review team attendance and filter records." : "Record your workday and review your attendance history."}</p>
        </div>
        <button onClick={load} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><RefreshCw size={15} /> Refresh</button>
      </div>

      {!canManage && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Clock3 size={21} /></div>
              <div>
                <p className="font-semibold text-slate-900">Today's attendance</p>
                <p className="mt-1 text-sm text-slate-500">{todayRecord ? (checkedOut ? "Your workday is checked out." : "You have checked in today.") : "You have not checked in today."}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!checkedIn && <select value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="office">Office</option><option value="remote">Work from home</option></select>}
              {!checkedIn && <button disabled={busy} onClick={() => runAction(() => api.post(`${endpoint.attendance}/check-in`, { workLocation }))} className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? "Saving..." : "Check in"}</button>}
              {checkedIn && !checkedOut && <button disabled={busy} onClick={() => runAction(() => api.patch(`${endpoint.attendance}/check-out`))} className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{busy ? "Saving..." : "Check out"}</button>}
              {checkedOut && <span className="inline-flex h-10 items-center rounded-xl bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">Completed</span>}
            </div>
          </div>
        </section>
      )}

      {canManage && (
        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
          <label className="text-xs font-semibold text-slate-500">From date<input type="date" value={filters.from} onChange={(e) => setFilters((old) => ({ ...old, from: e.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-700" /></label>
          <label className="text-xs font-semibold text-slate-500">To date<input type="date" min={filters.from || undefined} value={filters.to} onChange={(e) => setFilters((old) => ({ ...old, to: e.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-700" /></label>
          <label className="text-xs font-semibold text-slate-500">Status<select value={filters.status} onChange={(e) => setFilters((old) => ({ ...old, status: e.target.value }))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-700"><option value="">All statuses</option><option value="present">Present</option><option value="late">Late</option><option value="half_day">Half day</option><option value="absent">Absent</option><option value="work_from_home">Work from home</option><option value="on_leave">On leave</option></select></label>
          <div className="flex items-end gap-2"><button onClick={load} className="h-10 flex-1 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700">Apply filters</button><button onClick={() => setFilters({ from: "", to: "", status: "" })} className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600">Reset</button></div>
        </section>
      )}

      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2"><CalendarCheck size={18} className="text-blue-600" /><h2 className="font-bold text-slate-900">{canManage ? "Team attendance records" : "My attendance history"}</h2></div><span className="text-xs text-slate-400">{records.length} records</span></div>
        {loading ? <Loading /> : records.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400"><tr>{canManage && <th className="px-5 py-3 font-semibold">Employee</th>}<th className="px-5 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Check in</th><th className="px-4 py-3 font-semibold">Check out</th><th className="px-4 py-3 font-semibold">Hours</th><th className="px-4 py-3 font-semibold">Location</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map((record) => <tr key={record._id} className="hover:bg-slate-50/70">{canManage && <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-800">{record.employee?.firstName || ""} {record.employee?.lastName || ""}</p><p className="text-xs text-slate-400">{record.employee?.employeeCode || "—"}</p></td>}<td className="px-5 py-4 text-sm text-slate-700">{record.date || "—"}</td><td className="px-4 py-4 text-sm text-slate-600">{dateTime(record.checkIn)}</td><td className="px-4 py-4 text-sm text-slate-600">{dateTime(record.checkOut)}</td><td className="px-4 py-4 text-sm text-slate-600">{duration(record)}</td><td className="px-4 py-4 text-sm capitalize text-slate-600">{badge(record.workLocation)}</td><td className="px-4 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">{badge(record.status)}</span></td></tr>)}</tbody></table></div>
        ) : <EmptyState title="No attendance records" detail={error ? "Attendance data could not be loaded. Check the API response and server logs." : "Attendance records will appear here after a check-in or when your administrator records attendance."} />}
      </section>
    </div>
  );
}
