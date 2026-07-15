import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/parcels', label: 'Parcelles' },
  { to: '/recommendations', label: 'Recommandations' },
];

export default function Sidebar() {
  return (
    <aside className="border-r border-white/10 bg-slate-950/95 px-4 py-6 lg:w-72 lg:px-5">
      <div className="mb-8">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30">
          SI
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-white">Smart Irrigation</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pilotage intelligent de l'irrigation pour les exploitations agricoles.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'bg-cyan-400 text-slate-950 shadow-soft'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Connexion API</p>
        <p className="mt-2 leading-6">
          Le frontend est prêt à consommer FastAPI, les recommandations et les données météo.
        </p>
      </div>
    </aside>
  );
}
