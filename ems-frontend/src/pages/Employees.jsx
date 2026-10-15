import { useCallback, useEffect, useState } from "react";
import { Plus, Search, RefreshCw, UserRound, ShieldCheck } from "lucide-react";
import api, { endpoint } from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  employeeCode: "",
  jobTitle: "",
  joiningDate: "",
  department: "",
  role: "employee",
};
function extractRows(payload) {
  const value = payload?.data ?? payload?.employees ?? payload;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

export default function Employees() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [e, d] = await Promise.all([
        api.get(endpoint.employees),
        api.get(endpoint.departments),
      ]);
      setEmployees(extractRows(e.data));
      setDepartments(extractRows(d.data));
    } catch (err) {
      setError(err.userMessage || "Could not load employees.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const filtered = employees.filter((e) =>
    `${e.firstName} ${e.lastName} ${e.email || e.user?.email} ${e.employeeCode} ${e.jobTitle} ${e.department?.name} ${e.user?.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const change = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const body = { ...form };
      if (!body.department) delete body.department;
      if (!body.password) delete body.password;
      if (!isAdmin) delete body.role;
      await api.post(endpoint.employees, body);
      setModal(false);
      setForm(emptyForm);
      setNotice("Employee created successfully.");
      await load();
    } catch (err) {
      setError(err.userMessage || "Could not create employee.");
    } finally {
      setSaving(false);
    }
  };
  const changeRole = async (employee) => {
    const currentRole = employee.user?.role || "employee";
    const nextRole = currentRole === "hr" ? "employee" : "hr";
    const confirmed = window.confirm(
      `Change ${employee.firstName} ${employee.lastName}'s role from ${currentRole} to ${nextRole}?`,
    );
    if (!confirmed) return;
    setError("");
    setNotice("");
    try {
      const { data } = await api.patch(
        `${endpoint.employees}/${employee._id}/role`,
        { role: nextRole },
      );
      setNotice(data.message || `Role updated to ${nextRole}.`);
      await load();
    } catch (err) {
      setError(err.userMessage || "Could not update employee role.");
    }
  };
  const fieldClass =
    "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">PEOPLE</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Employees
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage employee records and team details.
          </p>
        </div>
        <button
          onClick={() => {
            setError("");
            setModal(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
        >
          <Plus size={17} /> Add employee
        </button>
      </div>
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, code, role..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <button
            onClick={load}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
        {loading ? (
          <Loading />
        ) : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Employee</th>
                  <th className="px-4 py-3.5 font-semibold">Code</th>
                  <th className="px-4 py-3.5 font-semibold">Department</th>
                  <th className="px-4 py-3.5 font-semibold">Job title</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Role</th>
                  {isAdmin && <th className="px-4 py-3.5 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600">
                          <UserRound size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {e.firstName} {e.lastName}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {e.email || e.user?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-600">
                      {e.employeeCode || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {e.department?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {e.jobTitle || "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${e.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {e.status || "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${e.user?.role === "hr" ? "bg-violet-50 text-violet-700" : e.user?.role === "admin" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                        {e.user?.role || "employee"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => changeRole(e)}
                          disabled={!e.user?._id || e.user?.role === "admin"}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ShieldCheck size={14} />
                          {e.user?.role === "hr" ? "Make employee" : "Make HR"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={search ? "No matching employees" : "No employees found"}
            detail={
              search
                ? "Try a different name, email, or employee code."
                : "Use Add employee to create the first employee record."
            }
          />
        )}
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Showing {filtered.length} of {employees.length} employees
        </div>
      </section>
      {modal && (
        <Modal title="Add a new employee" onClose={() => setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["firstName", "First name", true],
                ["lastName", "Last name", true],
                ["email", "Email address", true],
                ["password", "Temporary password", true],
                ["employeeCode", "Employee code", true],
                ["jobTitle", "Job title", true],
                ["joiningDate", "Joining date", true],
              ].map(([key, label, required]) => (
                <label
                  key={key}
                  className={`block text-sm font-medium text-slate-700 ${key === "jobTitle" ? "" : ""}`}
                >
                  {label}
                  {key === "joiningDate" ? (
                    <input
                      className={fieldClass}
                      type="date"
                      value={form[key]}
                      onChange={(e) => change(key, e.target.value)}
                      required={required}
                    />
                  ) : (
                    <input
                      className={fieldClass}
                      type={
                        key === "email"
                          ? "email"
                          : key === "password"
                            ? "password"
                            : "text"
                      }
                      value={form[key]}
                      onChange={(e) => change(key, e.target.value)}
                      required={required}
                      minLength={key === "password" ? 8 : undefined}
                      placeholder={key === "employeeCode" ? "EMP002" : ""}
                    />
                  )}
                </label>
              ))}
              {isAdmin && (
                <label className="block text-sm font-medium text-slate-700">
                  Account role
                  <select className={fieldClass} value={form.role} onChange={(e) => change("role", e.target.value)}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                  </select>
                  <span className="mt-1 block text-xs font-normal text-slate-500">HR accounts can manage people operations. Admin access cannot be assigned here.</span>
                </label>
              )}
              <label className="block text-sm font-medium text-slate-700">
                Department (optional)
                <select
                  className={fieldClass}
                  value={form.department}
                  onChange={(e) => change("department", e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create employee"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
