import RecommendationCard from '../components/dashboard/RecommendationCard';
import StatCard from '../components/dashboard/StatCard';
import { recommendations, stats, weatherHighlights } from '../data/mock';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Météo actuelle</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">Lecture rapide des conditions</h3>
            </div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
              Open-Meteo
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {weatherHighlights.map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Cycle ML</p>
          <h3 className="mt-3 text-2xl font-bold">Prétraitement, prédiction et recommandation</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Cette zone servira à brancher le backend FastAPI, le modèle de machine learning et le stockage
            des prédictions dans PostgreSQL.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-700">Dernières recommandations</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Historique à consulter depuis le dashboard</h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {recommendations.map((item) => (
            <RecommendationCard key={`${item.parcel}-${item.time}`} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}
