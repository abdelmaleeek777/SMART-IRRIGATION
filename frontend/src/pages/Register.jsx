import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Créer un compte</p>
        <h1 className="mt-2 text-3xl font-bold">Rejoindre Smart Irrigation</h1>
        <form className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-cyan-400" placeholder="Nom" />
          <input className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-cyan-400" placeholder="Prenom" />
          <input className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 outline-none focus:border-cyan-400" placeholder="Adresse e-mail" />
          <button type="button" className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Créer le compte
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-300">
          Déjà inscrit ?{' '}
          <Link to="/auth/login" className="font-semibold text-cyan-300">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
