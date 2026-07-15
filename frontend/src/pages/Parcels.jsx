import { parcels } from '../data/mock';

export default function Parcels() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-cyan-700">Nouvelle parcelle</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">Ajouter une parcelle</h3>

        <form className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-cyan-500" placeholder="Nom de la parcelle" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Superficie (ha)" />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Localisation GPS" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Type de sol" />
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500" placeholder="Type de culture" />
          </div>
          <button type="button" className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
            Enregistrer la parcelle
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-cyan-700">Parcelles existantes</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">Vue synthétique</h3>

        <div className="mt-6 space-y-4">
          {parcels.map((parcel) => (
            <article key={parcel.name} className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{parcel.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">{parcel.location}</p>
                </div>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                  {parcel.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div>
                  <span className="block text-slate-400">Culture</span>
                  {parcel.crop}
                </div>
                <div>
                  <span className="block text-slate-400">Sol</span>
                  {parcel.soil}
                </div>
                <div>
                  <span className="block text-slate-400">Surface</span>
                  {parcel.area}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
