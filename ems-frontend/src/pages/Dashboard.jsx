import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarCheck,
  Clock3,
  Users,
  UserRoundCheck,
} from "lucide-react";
import api, { endpoint } from "../services/api";
import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

function getRows(payload) {
  const candidate =
    payload?.data ??
    payload?.employees ??
    payload?.departments ??
    payload?.results ??
    payload;
  if (Array.isArray(candidate)) return candidate;
  if (Array.isArray(candidate?.data)) return candidate.data;
  if (Array.isArray(candidate?.items)) return candidate.items;
  return [];
}

export default function Dashboard() {
  const [state, setState] = useState({
    loading: true,
    employees: [],
    departments: [],
    error: "",
  });
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get(endpoint.employees),
      api.get(endpoint.departments),
      api.get(endpoint.dashboard),
    ]).then(([employeesResult, departmentsResult, dashboardResult]) => {
      if (!active) return;
      const employees =
        employeesResult.status === "fulfilled"
          ? getRows(employeesResult.value.data)
          : [];
      const departments =
        departmentsResult.status === "fulfilled"
          ? getRows(departmentsResult.value.data)
          : [];
      const dashboard =
        dashboardResult.status === "fulfilled"
          ? dashboardResult.value.data
          : null;
      setState({
        loading: false,
        employees,
        departments,
        dashboard,
        error:
          employeesResult.status === "rejected" &&
          departmentsResult.status === "rejected"
            ? "Could not load dashboard data. Check that you are signed in and the backend is running."
            : "",
      });
    });
    return () => {
      active = false;
    };
  }, []);
  if (state.loading) return <Loading label="Preparing your dashboard..." />;
  const activeEmployees = state.employees.filter(
    (e) => e.status === "active" && e.user?.isActive !== false,
  ).length;
  const inactiveEmployees = state.employees.filter(
    (e) => e.status === "inactive" || e.user?.isActive === false,
  ).length;
  const recent = [...state.employees]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-600">OVERVIEW</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good to see you.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here’s what’s happening across your workplace.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 sm:self-auto">
          <Clock3 size={15} />
          {today}
        </div>
      </div>
      {state.error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {state.error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total employees"
          value={state.employees.length}
          detail="Employee records in the system"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Active employees"
          value={activeEmployees}
          detail="Currently marked active"
          icon={UserRoundCheck}
          tone="emerald"
        />
        <StatCard
          title="Departments"
          value={state.departments.length}
          detail="Teams across your organisation"
          icon={Building2}
          tone="violet"
        />
        <StatCard
          title="Inactive employees"
          value={inactiveEmployees}
          detail="Accounts marked inactive"
          icon={Activity}
          tone="amber"
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Recently added employees
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest employee records
              </p>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {state.employees.length} total
            </span>
          </div>
          {recent.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent.map((employee) => (
                    <tr key={employee._id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                            {(employee.firstName?.[0] || "E") +
                              (employee.lastName?.[0] || "")}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {employee.employeeCode || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {employee.department?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${employee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {employee.status || "unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No employees yet"
              detail="Once employee records are created, they will appear here."
            />
          )}
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Your departments</h2>
              <p className="mt-1 text-xs text-slate-500">Teams and managers</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {state.departments.slice(0, 5).map((department) => (
              <div
                key={department._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    {department.code?.slice(0, 3) || "DEP"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {department.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {department.description || "No description"}
                    </p>
                  </div>
                </div>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${department.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                />
              </div>
            ))}
            {!state.departments.length && (
              <EmptyState
                title="No departments yet"
                detail="Create your first department to organise your team."
              />
            )}
          </div>
        </section>
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div className="mt-0.5 text-blue-600">
          <Activity size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Dashboard connected to your EMS API
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-800/80">
            Counts are calculated from the employee and department list APIs.
            Attendance and leave metrics can be wired to their exact backend
            response contracts next.
          </p>
        </div>
      </div>
    </div>
  );
}
