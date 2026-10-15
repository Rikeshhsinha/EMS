import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  Bell,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const configs = {
  attendance: {
    title: "Attendance",
    eyebrow: "TIME & ATTENDANCE",
    description: "Review attendance records returned by your EMS API.",
    icon: CalendarCheck,
    endpoint: "/attendance",
  },
  leaves: {
    title: "Leave requests",
    eyebrow: "TIME OFF",
    description: "View leave requests and their current approval status.",
    icon: CalendarDays,
    endpoint: "/leaves",
  },
  holidays: {
    title: "Holidays",
    eyebrow: "COMPANY CALENDAR",
    description:
      "Review the holiday calendar configured for your organisation.",
    icon: Bell,
    endpoint: "/holidays",
  },
  reports: {
    title: "Reports",
    eyebrow: "INSIGHTS",
    description: "View report data exposed by your EMS API.",
    icon: ChartNoAxesCombined,
    endpoint: "/reports",
  },
};
function getRows(payload) {
  const value = payload?.data ?? payload?.items ?? payload?.results ?? payload;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}
function humanize(value) {
  return String(value ?? "—")
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}
export default function ModulePage({ module }) {
  const config = configs[module];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: payload } = await api.get(config.endpoint);
      setData(getRows(payload));
    } catch (e) {
      setError(
        e.userMessage || `Could not load ${config.title.toLowerCase()}.`,
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [module]);
  const Icon = config.icon;
  const keys = data.length
    ? Object.keys(data[0])
        .filter((key) => !["_id", "__v", "password", "updatedAt"].includes(key))
        .slice(0, 6)
    : [];
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            {config.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {config.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
        </div>
        <button
          onClick={load}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={22} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? "—" : data.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Records returned by API</p>
        </div>
      </div>
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
          <p className="mt-1 text-xs">
            This page is connected to the collection endpoint. Create/update
            workflows need the exact route and payload contract from your
            backend controller.
          </p>
        </div>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">{config.title} records</h2>
        </div>
        {loading ? (
          <Loading />
        ) : data.length && keys.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  {keys.map((key) => (
                    <th key={key} className="px-5 py-3 font-semibold">
                      {humanize(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-slate-50/70">
                    {keys.map((key) => (
                      <td
                        key={key}
                        className="max-w-[280px] truncate px-5 py-4 text-sm text-slate-600"
                      >
                        {typeof item[key] === "object"
                          ? item[key]?.name ||
                            item[key]?.email ||
                            item[key]?._id ||
                            JSON.stringify(item[key])
                          : humanize(item[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={
              error
                ? "Data unavailable"
                : `No ${config.title.toLowerCase()} records`
            }
            detail={
              error
                ? "Check the API route, authentication cookie, and backend logs."
                : "No records were returned by the API yet."
            }
          />
        )}
      </section>
    </div>
  );
}
