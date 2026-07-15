export default function StatCard({ label, value, detail }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
          {detail}
        </span>
      </div>
    </article>
  );
}
