export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-700">
            Dashboard intelligent
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Gestion de l'irrigation</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 md:block">
            API météo active
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
