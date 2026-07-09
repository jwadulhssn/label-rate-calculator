export default function StatCard({
  label,
  value,
  sub,
  accent = "indigo",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  const colors: Record<string, string> = {
    indigo: "from-indigo-50 to-white border-indigo-200",
    emerald: "from-emerald-50 to-white border-emerald-200",
    amber: "from-amber-50 to-white border-amber-200",
    rose: "from-rose-50 to-white border-rose-200",
    violet: "from-violet-50 to-white border-violet-200",
  };

  const accentColors: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
    violet: "text-violet-600",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[accent]} rounded-xl sm:rounded-2xl border p-2.5 sm:p-5 shadow-sm text-center`}
    >
      <p className="text-[9px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-xl sm:text-2xl font-bold mt-0 sm:mt-1 ${accentColors[accent]}`}
      >
        {value}
      </p>
      {sub && (
        <p className="hidden sm:block text-xs text-slate-400 mt-1">{sub}</p>
      )}
    </div>
  );
}
