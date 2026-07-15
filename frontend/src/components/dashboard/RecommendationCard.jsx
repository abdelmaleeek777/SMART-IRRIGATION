export default function RecommendationCard({ parcel, status, water, reason, time }) {
  const isRecommended = status.toLowerCase().includes('recommandée');

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{parcel}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{status}</h3>
        </div>
        <span
          className={[
            'rounded-full px-3 py-1 text-xs font-semibold',
            isRecommended ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
          ].join(' ')}
        >
          {water}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{reason}</p>
      <div className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
        {time}
      </div>
    </article>
  );
}
