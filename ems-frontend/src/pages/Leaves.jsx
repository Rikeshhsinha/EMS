import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus, RefreshCw } from "lucide-react";
import api, { endpoint } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const initialForm = { leaveType: "casual", startDate: "", endDate: "", reason: "" };
const leaveTypes = ["casual", "sick", "earned", "unpaid", "maternity", "paternity", "other"];
function rowsFrom(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}
function dateLabel(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}
function humanize(value) {
  return String(value || "unknown").replace(/_/g, " ");
}

export default function Leaves() {
  const { user } = useAuth();
  const canReview = ["admin", "hr"].includes(user?.role);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("pending");
  const [reviewComments, setReviewComments] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(canReview ? endpoint.leaves : `${endpoint.leaves}/me`, { params: canReview && status ? { status } : {} });
      setLeaves(rowsFrom(data));
    } catch (err) {
      setError(err.userMessage || "Could not load leave requests.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [canReview, status]);

  useEffect(() => { load(); }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.post(endpoint.leaves, form);
      setNotice(data.message || "Leave request submitted.");
      setForm(initialForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.userMessage || "Could not submit the leave request.");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (leave) => {
    if (!window.confirm("Cancel this pending leave request?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.patch(`${endpoint.leaves}/${leave._id}/cancel`);
      setNotice(data.message || "Leave request cancelled.");
      await load();
    } catch (err) {
      setError(err.userMessage || "Could not cancel this request.");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (leave, decision) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.patch(`${endpoint.leaves}/${leave._id}/decision`, { decision, reviewComment: reviewComments[leave._id] || "" });
      setNotice(data.message || `Leave request ${decision}.`);
      await load();
    } catch (err) {
      setError(err.userMessage || "Could not review this request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-blue-600">TIME OFF</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Leave management</h1><p className="mt-2 text-sm text-slate-500">{canReview ? "Review and decide employee leave requests." : "Apply for leave and track your request history."}</p></div><div className="flex gap-2"><button onClick={load} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"><RefreshCw size={15} /> Refresh</button>{!canReview && <button onClick={() => { setError(""); setShowForm((value) => !value); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={16} /> Apply for leave</button>}</div></div>

      {showForm && !canReview && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 font-bold text-slate-900">New leave request</h2><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Leave type<select value={form.leaveType} onChange={(e) => setForm((old) => ({ ...old, leaveType: e.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">{leaveTypes.map((type) => <option key={type} value={type}>{humanize(type)}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Reason<textarea required maxLength={1000} rows={2} value={form.reason} onChange={(e) => setForm((old) => ({ ...old, reason: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Briefly explain the reason" /></label><label className="text-sm font-medium text-slate-700">Start date<input required type="date" min={new Date().toLocaleDateString("en-CA")} value={form.startDate} onChange={(e) => setForm((old) => ({ ...old, startDate: e.target.value, endDate: old.endDate && old.endDate < e.target.value ? "" : old.endDate }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label><label className="text-sm font-medium text-slate-700">End date<input required type="date" min={form.startDate || new Date().toLocaleDateString("en-CA")} value={form.endDate} onChange={(e) => setForm((old) => ({ ...old, endDate: e.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label><div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600">Cancel</button><button disabled={busy} className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Submitting..." : "Submit request"}</button></div></form></section>}

      {canReview && <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><CalendarDays size={18} className="text-blue-600" /><h2 className="font-bold text-slate-900">Request queue</h2></div><select aria-label="Filter by leave status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></select></section>}

      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">{canReview ? "Employee leave requests" : "My leave history"}</h2><span className="text-xs text-slate-400">{leaves.length} requests</span></div>{loading ? <Loading /> : leaves.length ? <div className="divide-y divide-slate-100">{leaves.map((leave) => <article key={leave._id} className="space-y-3 p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold capitalize text-slate-900">{humanize(leave.leaveType)} leave</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${leave.status === "approved" ? "bg-emerald-50 text-emerald-700" : leave.status === "rejected" ? "bg-rose-50 text-rose-700" : leave.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{humanize(leave.status)}</span></div><p className="mt-2 text-sm text-slate-600">{dateLabel(leave.startDate)} – {dateLabel(leave.endDate)}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-500">{leave.reason}</p>{canReview && <p className="mt-2 text-xs text-slate-400">Employee: {leave.employee?.firstName || ""} {leave.employee?.lastName || ""} · {leave.employee?.employeeCode || "No employee code"}</p>}{leave.reviewComment && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Review note: {leave.reviewComment}</p>}</div>{leave.status === "pending" && !canReview && <button disabled={busy} onClick={() => cancel(leave)} className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel request</button>}</div>{canReview && leave.status === "pending" && <div className="flex flex-col gap-2 sm:flex-row"><input value={reviewComments[leave._id] || ""} onChange={(e) => setReviewComments((old) => ({ ...old, [leave._id]: e.target.value }))} maxLength={1000} placeholder="Optional review comment" className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm" /><button disabled={busy} onClick={() => decide(leave, "approved")} className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">Approve</button><button disabled={busy} onClick={() => decide(leave, "rejected")} className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">Reject</button></div>}</article>)}</div> : <EmptyState title="No leave requests" detail={error ? "Leave data could not be loaded. Check the API response and server logs." : canReview ? "No requests match this status filter." : "Your leave applications will appear here."} />}</section>
    </div>
  );
}
