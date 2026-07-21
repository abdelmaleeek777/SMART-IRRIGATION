import {
  CartesianGrid,
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { weatherHistory, irrigationHistory, weatherHighlights } from '../data/mock';
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function TemperatureTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-iceBlue bg-white px-4 py-3 shadow-[0_14px_30px_rgba(2,48,71,0.12)]">
      <p className="text-sm font-semibold text-midnight">{item.fullDate}</p>
      <p className="mt-2 text-sm text-oceanBlue">
        Température: <span className="font-semibold text-midnight">{ }°C</span>
      </p>
    </div>
  );
}

function HumidityTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-iceBlue bg-white px-4 py-3 shadow-[0_14px_30px_rgba(2,48,71,0.12)]">
      <p className="text-sm font-semibold text-midnight">{item.fullDate}</p>
      <p className="mt-2 text-sm text-aquaBlue">
        Humidité: <span className="font-semibold text-midnight">{item.humidity}%</span>
      </p>
    </div>
  );
}

function IrrigationTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-iceBlue bg-white px-4 py-3 shadow-[0_14px_30px_rgba(2,48,71,0.12)]">
      <p className="text-sm font-semibold text-midnight">{label}</p>
      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="text-sm text-slate-600"
        >
          {item.name}:{" "}

          <span className="font-semibold text-[#0077B6]">
            {item.value} mm
          </span>

        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [parcelles, setParcelles] = useState([]);
  const [selectedParcelle, setSelectedParcelle] = useState(null);
  const [, setLoading] = useState(true);
  const [, setError] = useState('');

  useEffect(() => {
    const fetchParcelles = async () => {
      try {
        const data = await apiRequest('/parcelles/');
        setParcelles(data);
        if (data.length > 0) {
          setSelectedParcelle(data[0]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchParcelles();
  }, []);

  const handleNextParcelle = () => {
    const currentIndex = parcelles.findIndex(
      (parcelle) => parcelle.id_parcelle === selectedParcelle?.id_parcelle);
    const nextIndex = (currentIndex + 1) % parcelles.length;
    setSelectedParcelle(parcelles[nextIndex]);
  }

  const handlePreviousParcelle = () => {
    const currentIndex = parcelles.findIndex(
      (parcelle) => parcelle.id_parcelle === selectedParcelle?.id_parcelle
    );
    const previousIndex =
      (currentIndex - 1 + parcelles.length) % parcelles.length;
    setSelectedParcelle(parcelles[previousIndex]);
  };

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    if (!selectedParcelle) return;

    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError('');

        const latitude = selectedParcelle.latitude;
        const longitude = selectedParcelle.longitude;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Impossible de récupérer les données météo');
        }

        const data = await response.json();
        setWeather(data.current);

        // console.log(data);

      } catch (error) {
        setWeatherError(error.message);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(() => {
      fetchWeather();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [selectedParcelle]);
  useEffect(() => {
    if (parcelles.length <= 1) return;

    const parcelInterval = setInterval(() => {
      setSelectedParcelle((currentParcelle) => {
        const currentIndex = parcelles.findIndex(
          (parcelle) =>
            parcelle.id_parcelle === currentParcelle?.id_parcelle
        );

        const nextIndex = (currentIndex + 1) % parcelles.length;

        return parcelles[nextIndex];
      });
    }, 60000);

    return () => clearInterval(parcelInterval);

  }, [parcelles]);

  const realWeatherHighlights = weatherHighlights.map((item) => {
    const values = {
      Température: weather ? `${weather.temperature_2m}°C` : '--',
      Humidité: weather ? `${weather.relative_humidity_2m}%` : '--',
      Pluie: weather ? `${weather.precipitation} mm` : '--',
      Vent: weather ? `${weather.wind_speed_10m} km/h` : '--',
    };

    return {
      ...item,
      value: values[item.label] ?? item.value,
    };
  });

  const [weatherHistoryData, setWeatherHistoryData] = useState([]);

  return (
    <div className="space-y-8">
      {/* <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section> */}

      <section className="grid gap-6">
        <div className="rounded-3xl border border-aquaBlue/20 p-6 bg-backdrpop-blur shadow-[0_18px_60px_rgba(2,48,71,0.08)]">

          {/* Header */}
          <div className="flex items-start">
            <div>
              <p className="text-2xl uppercase font-semibold text-cyan-700">
                Météo actuelle
              </p>

              <div className="mt-2 flex items-center gap-4">

                {/* Previous */}
                <button
                  onClick={handlePreviousParcelle}
                  disabled={parcelles.length <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full
                       text-2xl font-bold text-cyan-700
                       transition-all duration-200
                       hover:bg-cyan-100 hover:scale-110
                       active:scale-95
                       disabled:opacity-30"
                >
                  &lt;
                </button>

                {/* Parcel name animation */}
                <div className="min-w-32 overflow-hidden text-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={selectedParcelle?.id_parcelle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="block font-semibold text-slate-900"
                    >
                      {selectedParcelle?.nom || 'Aucune parcelle'}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Next */}
                <button
                  onClick={handleNextParcelle}
                  disabled={parcelles.length <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full
                       text-2xl font-bold text-cyan-700
                       transition-all duration-200
                       hover:bg-cyan-100 hover:scale-110
                       active:scale-95
                       disabled:opacity-30"
                >
                  &gt;
                </button>

              </div>
            </div>
          </div>

          {/* Weather cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedParcelle?.id_parcelle}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {realWeatherHighlights.map((item) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden rounded-2xl border border-iceBlue bg-arcticWhite/95 p-5 shadow-[0_12px_30px_rgba(2,48,71,0.06)] backdrop-blur"
                >
                  <div className="relative z-10 space-y-3">
                    <p className="text-sm font-medium text-midnight/60">
                      {item.label}
                    </p>

                    <p className="text-3xl font-bold text-midnight">
                      {item.value}
                    </p>
                  </div>

                  <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-45">
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${item.accent} rotate-[-14deg]`}
                    >
                      <item.icon
                        className={`h-12 w-12 ${item.iconColor}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-iceBlue bg-arcticWhite p-6 shadow-[0_18px_60px_rgba(2,48,71,0.08)]">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oceanBlue">Évolution de la température</p>
            <h3 className="mt-2 text-2xl font-bold text-midnight">Température des 7 derniers jours</h3>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    {/* Stronger blue at the top */}
                    <stop offset="0%" stopColor="#0077B6" stopOpacity={0.4} />

                    {/* Transparent at the bottom */}
                    <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#CAF0F8" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#0F172A', fontSize: 12 }}
                  width={34}
                />
                <Tooltip content={<TemperatureTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#0077B6"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#0077B6', strokeWidth: 1, fill: '#0077B6' }}
                  activeDot={{ r: 6 }}
                  fill="url(#temperatureGradient)"
                />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl border border-iceBlue bg-arcticWhite p-6 shadow-[0_18px_60px_rgba(2,48,71,0.08)]">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oceanBlue">Évolution de l'humidité</p>
            <h3 className="mt-2 text-2xl font-bold text-midnight">Humidité des 7 derniers jours</h3>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    {/* Stronger blue at the top */}
                    <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.4} />

                    {/* Transparent at the bottom */}
                    <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#CAF0F8" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#0F172A', fontSize: 12 }}
                  width={34}
                />
                <Tooltip content={<HumidityTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  stroke="#00B4D8"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#00B4D8', strokeWidth: 2, fill: '#F7FBFC' }}
                  activeDot={{ r: 6 }}
                  fill="url(#humidityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>



      </section>
      <div className="rounded-3xl border border-iceBlue bg-arcticWhite p-6 shadow-[0_18px_60px_rgba(2,48,71,0.08)]">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oceanBlue">Historique de recommandations</p>
          <h3 className="mt-2 text-2xl font-bold text-midnight">Quantité d'eau recommandée par parcelle</h3>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={irrigationHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#CAF0F8" strokeDasharray="3 3" vertical={false} />
              <Legend wrapperStyle={{ paddingBottom: 8 }} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#0F172A', fontSize: 12 }}
                width={34}
                label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#0F172A' }}
              />
              <Tooltip content={<IrrigationTooltip />} />
              <Bar
                dataKey="parcel1"
                name="Parcelle 1"
                fill="#0077B6"

                barSize={44}
                stackId="irrigation"
              />
              <Bar
                dataKey="parcel2"
                name="Parcelle 2"
                fill="#00B4D8"

                barSize={44}
                stackId="irrigation"
              />
              <Bar
                dataKey="parcel3"
                name="Parcelle 3"
                fill="#48CAE4"
                radius={[16, 16, 0, 0]}
                barSize={44}
                stackId="irrigation"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
