import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7FBFC] px-4 py-8 text-[#0F172A] sm:px-6 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(72,202,228,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,119,182,0.12),_transparent_24%)]" />
      <div className="pointer-events-none absolute left-1/2 top-14 h-72 w-72 -translate-x-1/2 rounded-full bg-[#CAF0F8]/80 blur-3xl" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/75 bg-white/80 p-8 shadow-[0_20px_60px_rgba(2,48,71,0.08)] backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0077B6]">Sign In</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#023047]">Access Your Dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sign in to track your exploitations, parcels, and irrigation recommendations.
        </p>
        <form className="mt-8 space-y-4">
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0077B6] focus:ring-4 focus:ring-[#CAF0F8]/60" placeholder="Email address" />
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0077B6] focus:ring-4 focus:ring-[#CAF0F8]/60" placeholder="Password" type="password" />
          <button type="button" className="w-full rounded-2xl bg-[#0077B6] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(0,119,182,0.22)] transition hover:bg-[#005f94]">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[#0077B6] hover:text-[#005f94]">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
