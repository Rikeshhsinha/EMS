export default function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone] || tones.blue}`}
        >
          <Icon size={21} />
        </div>
      </div>
      {detail && <p className="mt-4 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}
