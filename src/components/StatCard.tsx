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
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/20",
    violet: "from-violet-500/20 to-violet-600/10 border-violet-500/20",
  };

  const accentColors: Record<string, string> = {
    indigo: "text-indigo-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    violet: "text-violet-300",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[accent]} rounded-xl sm:rounded-2xl border p-2.5 sm:p-5 backdrop-blur-sm`}
    >
      <p className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-sm sm:text-2xl font-bold mt-0 sm:mt-1 ${accentColors[accent]}`}>
        {value}
      </p>
      {sub && <p className="hidden sm:block text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
