import { useCallback, useEffect, useState } from "react";
import { Building2, Plus, RefreshCw, Search, UsersRound } from "lucide-react";
import api, { endpoint } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

const blank = { name: "", code: "", description: "" };

function rows(payload) {
  const value = payload?.data ?? payload?.departments ?? payload;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

export default function Departments() {
  const { user } = useAuth();
  const canManage = String(user?.role || "").toLowerCase() === "admin";
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(endpoint.departments);
      setDepartments(rows(data));
    } catch (e) {
      setError(e.userMessage || "Could not load departments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = departments.filter((d) =>
    `${d.name} ${d.code} ${d.description}`.toLowerCase().includes(search.toLowerCase()),
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api.post(endpoint.departments, form);
      setModal(false);
      setForm(blank);
      setNotice("Department created successfully.");
      await load();
    } catch (e) {
      setError(e.userMessage || "Could not create department.");
    } finally {
      setSaving(false);
    }
  };

  const field = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">ORGANISATION</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Departments</h1>
          <p className="mt-2 text-sm text-slate-500">
            {canManage ? "Manage department details and teams." : "View department details and team managers."}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setError(""); setModal(true); }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} /> Add department
          </button>
        )}
      </div>

      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
        <button onClick={load} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? <Loading /> : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((d) => (
            <article key={d._id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-violet-600"><Building2 size={22} /></div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{d.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div className="mt-5">
                <p className="text-lg font-bold text-slate-900">{d.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{d.code}</p>
                <p className="mt-3 min-h-10 text-sm leading-6 text-slate-500">{d.description || "No department description has been added."}</p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="flex items-center gap-2"><UsersRound size={15} /> Manager</span>
                <span className="font-semibold text-slate-700">{d.manager ? `${d.manager.firstName || ""} ${d.manager.lastName || ""}`.trim() || "Assigned" : "Not assigned"}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState title={search ? "No matching departments" : "No departments yet"} detail={search ? "Try another department name or code." : canManage ? "Create a department to start organising your employees." : "No department records are available yet."} />
        </div>
      )}

      <p className="text-xs text-slate-400">Showing {filtered.length} of {departments.length} departments</p>

      {canManage && modal && (
        <Modal title="Create department" onClose={() => setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Department name
              <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Engineering" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">Department code
              <input className={field} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ENG" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">Description
              <textarea className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this department do?" />
            </label>
            {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setModal(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
              <button disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Create department"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
