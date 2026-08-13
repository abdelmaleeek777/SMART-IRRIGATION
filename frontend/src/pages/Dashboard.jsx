import {
  CartesianGrid,
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Sprout } from 'lucide-react';
import { weatherHighlights } from '../data/mock';
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

function TemperatureTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-2xl border border-iceBlue bg-white px-4 py-3 shadow-[0_14px_30px_rgba(2,48,71,0.12)]">
      <p className="text-sm font-semibold text-midnight">{item.fullDate}</p>
      <p className="mt-2 text-sm text-oceanBlue">
        Température: <span className="font-semibold text-midnight">{item.temperature}°C</span>
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
    <div className="min-w-56 rounded-2xl border border-cyan-100 bg-white/95 px-4 py-3 shadow-[0_16px_36px_rgba(2,48,71,0.16)] backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.fullDate || label}</p>
      <div className="mt-3 space-y-2 border-y border-slate-100 py-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-5 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="font-bold text-midnight">{Number(entry.value || 0).toFixed(1)} mm</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-sm font-medium text-slate-600">Total recommandé</p>
      <p className="text-2xl font-bold text-oceanBlue">
        {Number(item.total ?? 0).toFixed(1)} <span className="text-sm">mm</span>
      </p>
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
    if (filteredParcels.length === 0) {
      setSelectedParcelle(null);
      return;
    }
    const currentIndex = filteredParcels.findIndex(
      (parcelle) => parcelle.id_parcelle === selectedParcelle?.id_parcelle);
    const nextIndex = (currentIndex + 1) % filteredParcels.length;
    setSelectedParcelle(filteredParcels[nextIndex]);
  }

  const handlePreviousParcelle = () => {
    if (filteredParcels.length === 0) {
      setSelectedParcelle(null);
      return;
    }
    const currentIndex = filteredParcels.findIndex(
      (parcelle) => parcelle.id_parcelle === selectedParcelle?.id_parcelle
    );
    const previousIndex =
      (currentIndex - 1 + filteredParcels.length) % filteredParcels.length;
    setSelectedParcelle(filteredParcels[previousIndex]);
  };

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isFarmMenuOpen, setIsFarmMenuOpen] = useState(false);
  const [chartFarmId, setChartFarmId] = useState("");
  const [chartParcelId, setChartParcelId] = useState("");

  const fetchFarms = async () => {
    try {
      const data = await apiRequest('/exploitations/');
      setFarms(data);
    }
    catch (error) {
      console.error("Error fetching farms:", error);
    }
  }
  useEffect(() => {
    fetchFarms();
  }, []);

  const filteredParcels = selectedFarmId
  ? parcelles.filter(
      (parcelle) =>
        String(parcelle.id_exploitation) === String(selectedFarmId)
    )
  : parcelles;
  const selectedFarm = farms.find(
    (farm) => String(farm.id_exploitation) === String(selectedFarmId)
  );

  useEffect(() => {
    setSelectedParcelle(filteredParcels[0] ?? null);
  }, [selectedFarmId, parcelles]);

  const chartFarmParcels = chartFarmId
    ? parcelles.filter((parcel) => String(parcel.id_exploitation) === String(chartFarmId))
    : parcelles;
  const chartParcels = chartParcelId
    ? chartFarmParcels.filter((parcel) => String(parcel.id_parcelle) === String(chartParcelId))
    : chartFarmParcels;

  useEffect(() => {
    setChartParcelId('');
  }, [chartFarmId]);

  const [recommendationHistory, setRecommendationHistory] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchRecommendationHistory = async () => {
      try {
        const histories = await Promise.all(
          chartParcels.map(async (parcel) => ({
            parcel,
            records: await apiRequest(`/recommendation/history/${parcel.id_parcelle}`),
          }))
        );

        const dates = Array.from({ length: 7 }, (_, index) => {
          const date = new Date();
          date.setHours(12, 0, 0, 0);
          date.setDate(date.getDate() - (6 - index));
          return date.toISOString().slice(0, 10);
        });

        const chartData = dates.map((date) => {
          const point = {
            date: new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
              weekday: 'short',
            }),
            fullDate: date,
          };

          histories.forEach(({ parcel, records }) => {
            const record = records.find(
              (item) => item.predicted_at.slice(0, 10) === date
            );
            point[`parcel_${parcel.id_parcelle}`] =
              record?.recommended_irrigation_mm ?? 0;
          });

          point.total = Object.entries(point)
            .filter(([key]) => key.startsWith('parcel_'))
            .reduce((sum, [, value]) => sum + Number(value || 0), 0);

          return point;
        });

        if (!cancelled) setRecommendationHistory(chartData);
      } catch (error) {
        if (!cancelled) {
          console.error('Recommendation history error:', error);
          setRecommendationHistory([]);
        }
      }
    };

    fetchRecommendationHistory();
    return () => {
      cancelled = true;
    };
  }, [chartFarmId, chartParcelId, parcelles]);

  const totalRecommendedWater = recommendationHistory.reduce(
    (sum, day) => sum + Number(day.total || 0),
    0
  );
  const averageRecommendedWater = recommendationHistory.length
    ? totalRecommendedWater / recommendationHistory.length
    : 0;
  const maximumRecommendedWater = Math.max(
    1,
    ...recommendationHistory.flatMap((day) =>
      chartParcels.map((parcel) => Number(day[`parcel_${parcel.id_parcelle}`] || 0))
    )
  );
  
  console.log("Farms:", farms);
  console.log("Selected Farm ID:", filteredParcels);
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
    if (filteredParcels.length <= 1) return;

    const parcelInterval = setInterval(() => {
      setSelectedParcelle((currentParcelle) => {
        const currentIndex = filteredParcels.findIndex(
          (parcelle) =>
            parcelle.id_parcelle === currentParcelle?.id_parcelle
        );

        const nextIndex = (currentIndex + 1) % filteredParcels.length;

        return filteredParcels[nextIndex];
      });
    }, 10000);

    return () => clearInterval(parcelInterval);

  }, [selectedFarmId, parcelles]);

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


  useEffect(() => {
    if (!selectedParcelle) return;

    const fetchWeatherHistory = async () => {
      try {
        const latitude = selectedParcelle.latitude;
        const longitude = selectedParcelle.longitude;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min&timezone=auto&past_days=7`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Impossible de récupérer l'historique météo");
        }

        const data = await response.json();
        const dates = data.daily.time;
        const last7Days = dates.slice(0, 7)
        const weatherHistory = last7Days.map((date, index) => {
          return {
            date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
            temperature: (data.daily.temperature_2m_max[index] + data.daily.temperature_2m_min[index]) / 2,
            humidity: (data.daily.relative_humidity_2m_max[index] + data.daily.relative_humidity_2m_min[index]) / 2,
            fullDate: new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
          }
        })
        setWeatherHistoryData(weatherHistory);
        console.log("Weather History:", data);

      } catch (error) {
        console.error("Weather history error:", error);
      }
    };

    fetchWeatherHistory();

  }, [selectedParcelle]);




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
          <div className="relative flex flex-col gap-5 sm:block">
            <div>
              <p className="text-2xl uppercase font-semibold text-cyan-700">
                Météo actuelle
              </p>

              <div className="mt-2 flex items-center gap-4">

                {/* Previous */}
                <button
                  onClick={handlePreviousParcelle}
                  disabled={filteredParcels.length <= 1}
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
                  disabled={filteredParcels.length <= 1}
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
            <div className="relative z-[100] w-full sm:absolute sm:right-0 sm:top-0 sm:w-72">
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                aria-label="Filtrer les données par ferme"
                className="sr-only"
              >
                <option value="">Sélectionner une ferme</option>

                {farms.map((farm) => (
                  <option
                    key={farm.id_exploitation}
                    value={farm.id_exploitation}
                    className="bg-white py-2 text-slate-800"
                  >
                    {farm.nom}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsFarmMenuOpen((isOpen) => !isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isFarmMenuOpen}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-cyan-300/30 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800  outline-none transition hover:border-cyan-400 "
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <Sprout className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <span className="min-w-0 flex-1 truncate">{selectedFarm?.nom || 'Sélectionner une ferme'}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isFarmMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
              </button>

              <AnimatePresence>
                {isFarmMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    role="listbox"
                    className="absolute left-0 right-0 z-[100] top-[calc(100%+10px)] overflow-hidden rounded-2xl border border-cyan-200 bg-white p-2 "
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={!selectedFarmId}
                      onClick={() => {
                        setSelectedFarmId('');
                        setIsFarmMenuOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${!selectedFarmId ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      Toutes les fermes
                    </button>
                    {farms.map((farm) => {
                      const isSelected = String(farm.id_exploitation) === String(selectedFarmId);
                      return (
                        <button
                          key={farm.id_exploitation}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSelectedFarmId(String(farm.id_exploitation));
                            setIsFarmMenuOpen(false);
                          }}
                          className={`mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isSelected ? 'bg-cyan-50 text-cyan-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          {farm.nom}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
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
              <AreaChart data={weatherHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
              <AreaChart data={weatherHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oceanBlue">Historique de recommandations</p>
          <h3 className="mt-2 text-2xl font-bold text-midnight">Quantité d'eau recommandée par parcelle</h3>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[540px]">
            <select value={chartFarmId} onChange={(event) => setChartFarmId(event.target.value)} aria-label="Filtrer le graphique par ferme" className="w-full rounded-xl border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100">
              <option value="">Toutes les fermes</option>
              {farms.map((farm) => <option key={farm.id_exploitation} value={farm.id_exploitation}>{farm.nom}</option>)}
            </select>
            <select value={chartParcelId} onChange={(event) => setChartParcelId(event.target.value)} aria-label="Filtrer le graphique par parcelle" className="w-full rounded-xl border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" disabled={chartFarmParcels.length === 0}>
              <option value="">Toutes les parcelles</option>
              {chartFarmParcels.map((parcel) => <option key={parcel.id_parcelle} value={parcel.id_parcelle}>{parcel.nom}</option>)}
            </select>
          </div>
        </div>

        {/* Summary cards hidden to keep the original chart-focused layout.
        <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total période</p>
            <p className="mt-1 text-xl font-bold text-midnight">{totalRecommendedWater.toFixed(1)} <span className="text-sm font-semibold text-oceanBlue">mm</span></p>
          </div>
          <div className="rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Moyenne / jour</p>
            <p className="mt-1 text-xl font-bold text-midnight">{averageRecommendedWater.toFixed(1)} <span className="text-sm font-semibold text-oceanBlue">mm</span></p>
          </div>
        </div>
        */}
        <div className="overflow-x-auto rounded-2xl border border-iceBlue bg-white/70">
          <div className="h-[320px] min-w-[680px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recommendationHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#CAF0F8" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontSize: 12 }} width={34} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#0F172A' }} />
                <Tooltip content={<IrrigationTooltip />} />
                <Bar dataKey="total" name="Total recommandé" fill="#00B4D8" barSize={44} radius={[12, 12, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {false && (
          <div className="min-w-[720px] p-4">
            <div
              className="grid items-center gap-2 text-xs"
              style={{ gridTemplateColumns: `minmax(150px, 1.4fr) repeat(${recommendationHistory.length || 7}, minmax(64px, 1fr))` }}
            >
              <div className="px-3 pb-2 font-bold uppercase tracking-wider text-slate-400">Parcelle</div>
              {recommendationHistory.map((day) => (
                <div key={day.fullDate} className="pb-2 text-center font-bold uppercase tracking-wider text-slate-400">
                  {day.date}
                </div>
              ))}
              {chartParcels.map((parcel) => (
                <div key={parcel.id_parcelle} className="contents">
                  <div className="truncate rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-midnight" title={parcel.nom}>
                    {parcel.nom}
                  </div>
                  {recommendationHistory.map((day) => {
                    const value = Number(day[`parcel_${parcel.id_parcelle}`] || 0);
                    const intensity = value / maximumRecommendedWater;
                    return (
                      <div
                        key={`${parcel.id_parcelle}-${day.fullDate}`}
                        title={`${parcel.nom} · ${day.fullDate}: ${value.toFixed(1)} mm`}
                        className="flex min-h-12 items-center justify-center rounded-xl text-xs font-bold transition hover:scale-105 hover:shadow-md"
                        style={{
                          backgroundColor: value ? `rgba(0, 180, 216, ${0.16 + intensity * 0.72})` : '#F8FAFC',
                          color: intensity > 0.52 ? '#FFFFFF' : '#075985',
                        }}
                      >
                        {/*
                        {value > 0 ? `${value.toFixed(1)} mm` : '—'}
                        */}
                        {value > 0 ? `${value.toFixed(1)} mm` : '-'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {chartParcels.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-500">Aucune parcelle disponible.</p>
            )}
          </div>
          )}
          {false && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recommendationHistory} margin={{ top: 16, right: 18, left: 0, bottom: 0 }}>
              <defs>
              </defs>
              <CartesianGrid stroke="#CAF0F8" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#0F172A', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#0F172A', fontSize: 12 }}
                width={34}
                label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#0F172A' }}
              />
              <Tooltip content={<IrrigationTooltip />} />
              {/* Total series intentionally hidden; grouped parcel bars are shown below.
              <Bar dataKey="total" name="Total recommandé" fill="url(#irrigationTotalGradient)" radius={[10, 10, 3, 3]} barSize={42} />
              */}
              {/*
              {false && chartParcels.map((parcel, index) => (
                <Bar
                  key={parcel.id_parcelle}
                  dataKey={`parcel_${parcel.id_parcelle}`}
                  name={parcel.nom}
                  fill={['#0077B6', '#00B4D8', '#48CAE4', '#0096C7', '#90E0EF'][index % 5]}
                  radius={index === chartParcels.length - 1 ? [16, 16, 0, 0] : [0, 0, 0, 0]}
                  barSize={44}
                  stackId="irrigation"
                />
              ))}
              */}
              <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12, fontWeight: 600 }} />
              {chartParcels.map((parcel, index) => {
                const color = ['#0077B6', '#00B4D8', '#48CAE4', '#0096C7', '#7DD3FC'][index % 5];
                return (
                  <Line
                    key={parcel.id_parcelle}
                    type="monotone"
                    dataKey={`parcel_${parcel.id_parcelle}`}
                    name={parcel.nom}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: color, stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: color, stroke: '#FFFFFF', strokeWidth: 3 }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
