import RecommendationCard from '../components/dashboard/RecommendationCard';
import { recommendations } from '../data/mock';

export default function Recommendations() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-cyan-700">Historique ML</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">Recommandations d'irrigation</h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Chaque recommandation combine les données météo, les caractéristiques de la parcelle et la sortie du modèle de prédiction.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {recommendations.map((item) => (
          <RecommendationCard key={`${item.parcel}-${item.time}`} {...item} />
        ))}
      </div>
    </section>
  );
}
