import { Link } from 'react-router-dom';

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

const floatingCards = [
  { label: 'Temperature', value: '31°C', accent: 'bg-white/80 text-slate-900' },
  { label: 'Humidity', value: '42%', accent: 'bg-[#CAF0F8]/90 text-slate-900' },
  { label: 'Rainfall', value: '0.4 mm', accent: 'bg-white/75 text-slate-900' },
  { label: 'Water Savings', value: '28%', accent: 'bg-[#0077B6]/10 text-[#023047]' },
];

const trustSignals = ['Smart Recommendations', 'Real-Time Weather', 'Water Optimization'];

const features = [
  {
    title: 'Weather intelligence',
    text: 'Real-time weather signals are analyzed to anticipate irrigation needs with precision.',
  },
  {
    title: 'Crop-aware decisions',
    text: 'Each recommendation considers the parcel, crop type, soil profile, and farm context.',
  },
  {
    title: 'Water efficiency',
    text: 'AI suggests the right amount of water to reduce waste and improve operational efficiency.',
  },
];

const dashboardMetrics = [
  { label: 'Temp', value: '31°C' },
  { label: 'Humidity', value: '42%' },
  { label: 'Rain', value: '0.4 mm' },
];

export default function Home() {
  return (
    <div id="home" className="min-h-screen bg-[#F7FBFC] text-[#0F172A]">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(72,202,228,0.24),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(0,119,182,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(202,240,248,0.95),_transparent_28%)]" />
        <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00B4D8]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8">
          <header className="mb-8 rounded-full border border-white/60 bg-white/60 px-4 py-4 shadow-[0_10px_40px_rgba(2,48,71,0.06)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0077B6] text-white shadow-[0_10px_24px_rgba(0,119,182,0.25)]">
                  <span className="relative inline-flex h-5 w-5 items-center justify-center">
                    <span className="absolute h-4 w-4 rotate-45 rounded-full rounded-tl-none border border-white/95" />
                    <span className="absolute -top-0.5 h-1.5 w-1.5 rounded-full bg-white/95" />
                  </span>
                </span>
                <div>
                  <p className="text-base font-extrabold tracking-tight text-[#023047]">WaterWise</p>
                  <p className="text-xs font-medium text-slate-500">AI irrigation decision platform</p>
                </div>
              </Link>

              <nav className="hidden items-center gap-8 lg:flex">
                {navigation.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-slate-600 transition hover:text-[#023047]"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#023047]"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="rounded-full bg-[#0077B6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,119,182,0.26)] transition hover:bg-[#005f94]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </header>

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0077B6]/15 bg-white/70 px-4 py-2 text-sm font-semibold text-[#023047] shadow-[0_8px_30px_rgba(2,48,71,0.04)] backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#00B4D8]" />
                AI-Powered Smart Irrigation
              </div>

              <h1 className="mt-8 text-5xl font-black tracking-tight text-[#0F172A] sm:text-6xl lg:text-7xl lg:leading-[0.95]">
                Every Drop Counts.
                <span className="mt-3 block bg-gradient-to-r from-[#0077B6] via-[#00B4D8] to-[#48CAE4] bg-clip-text text-transparent">
                  Irrigate Smarter.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                Make smarter irrigation decisions with AI-powered recommendations based on your crops,
                soil, and real-time weather conditions.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center rounded-full bg-[#0077B6] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(0,119,182,0.28)] transition hover:-translate-y-0.5 hover:bg-[#005f94]"
                >
                  Get Started
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-full border border-[#0077B6]/20 bg-white/65 px-7 py-3.5 text-sm font-semibold text-[#023047] backdrop-blur transition hover:border-[#0077B6]/35 hover:bg-white"
                >
                  Discover How It Works
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-500">
                {trustSignals.map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span>{item}</span>
                    {index < trustSignals.length - 1 ? <span className="text-slate-300">•</span> : null}
                  </div>
                ))}
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3" id="features">
                {features.map((feature) => (
                  <article
                    key={feature.title}
                    className="rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_14px_45px_rgba(2,48,71,0.06)] backdrop-blur"
                  >
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0077B6]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="pointer-events-none absolute inset-0 -z-10 translate-y-10 rounded-[2.5rem] bg-[#00B4D8]/20 blur-3xl" />
              {floatingCards.map((card, index) => (
                <div
                  key={card.label}
                  className={`absolute hidden rounded-2xl border border-white/70 px-4 py-3 shadow-[0_16px_35px_rgba(2,48,71,0.08)] backdrop-blur-xl md:block ${card.accent}`}
                  style={{
                    left: index % 2 === 0 ? `${index * 14}%` : 'auto',
                    right: index % 2 !== 0 ? `${8 + index * 3}%` : 'auto',
                    top: index === 0 ? '8%' : index === 1 ? '18%' : index === 2 ? '70%' : '76%',
                  }}
                >
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <p className="mt-1 text-lg font-bold text-[#023047]">{card.value}</p>
                </div>
              ))}

              <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-[0_24px_90px_rgba(2,48,71,0.12)] backdrop-blur-2xl sm:p-6">
                <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-br from-white via-[#F7FBFC] to-[#CAF0F8]/60 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Current Weather
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-[#023047]">Parcel Delta 12</h2>
                      <p className="mt-1 text-sm text-slate-500">Sandy loam soil · Tomato crop</p>
                    </div>
                    <div className="rounded-2xl bg-[#023047] px-4 py-3 text-right text-white shadow-[0_14px_30px_rgba(2,48,71,0.18)]">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/70">Status</p>
                      <p className="mt-1 text-sm font-semibold">AI Recommended</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {dashboardMetrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl bg-white/80 p-4 shadow-[0_10px_30px_rgba(2,48,71,0.05)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-xl font-bold text-[#023047]">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[1.5rem] bg-[#023047] p-5 text-white shadow-[0_18px_40px_rgba(2,48,71,0.18)]">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/65">Irrigation</p>
                          <p className="mt-2 text-lg font-semibold">Recommended Water: 24 mm</p>
                        </div>
                        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#CAF0F8]">
                          Optimal window in 3h
                        </div>
                      </div>

                      <div className="mt-5 h-28 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-3">
                        <div className="flex h-full items-end gap-2">
                          {[18, 26, 20, 34, 29, 44, 36].map((height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t-full bg-gradient-to-t from-[#48CAE4] to-[#CAF0F8]"
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-[#0077B6]/10 bg-white p-5 shadow-[0_14px_30px_rgba(2,48,71,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Water savings
                      </p>
                      <p className="mt-2 text-4xl font-black text-[#0077B6]">28%</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Compared with manual scheduling, WaterWise helps reduce over-irrigation while keeping crops supported.
                      </p>
                      <div className="mt-6 rounded-[1.25rem] bg-[#CAF0F8]/70 p-4">
                        <p className="text-sm font-semibold text-[#023047]">AI confidence</p>
                        <div className="mt-3 h-2 rounded-full bg-white">
                          <div className="h-2 w-[84%] rounded-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8]" />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Strong recommendation based on weather, soil, and crop data.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="how-it-works" className="mt-20 grid gap-4 rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_14px_50px_rgba(2,48,71,0.06)] backdrop-blur sm:grid-cols-3 sm:p-8">
            {[
              'Collect real-time weather and farm context.',
              'Analyze soil, crop, and field conditions with AI.',
              'Generate a premium irrigation recommendation instantly.',
            ].map((step, index) => (
              <div key={step} className="rounded-[1.5rem] bg-[#F7FBFC] p-5">
                <p className="text-sm font-semibold text-[#0077B6]">0{index + 1}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>

          <div id="about" className="mt-14 flex flex-col gap-4 border-t border-[#0077B6]/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              WaterWise is designed as a premium AI SaaS interface for precision agriculture, combining modern product design with practical irrigation intelligence.
            </p>
            <div className="flex gap-3">
              <Link
                to="/auth/register"
                className="rounded-full bg-[#0077B6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#005f94]"
              >
                Get Started
              </Link>
              <Link
                to="/dashboard"
                className="rounded-full border border-[#0077B6]/15 bg-white px-5 py-3 text-sm font-semibold text-[#023047] transition hover:border-[#0077B6]/30"
              >
                Preview Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
