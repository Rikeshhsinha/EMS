import { UsersRound } from "lucide-react";

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
        <UsersRound size={21} />
      </div>
      {!compact && (
        <div>
          <p className="text-[17px] font-extrabold tracking-tight text-slate-900">
            PeopleDesk
          </p>
          <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-slate-400">
            Employee Suite
          </p>
        </div>
      )}
    </div>
  );
}
