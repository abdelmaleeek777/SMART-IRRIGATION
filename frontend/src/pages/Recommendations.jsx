import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout,
  MapPin,
  Layers,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  History,
  AlertCircle,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Gauge,
  X,
  BarChart3,
  Zap,
} from "lucide-react";
import { apiRequest } from "../services/api";

/* ─── Animation variants ──────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

const detailVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  show: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function Recommendations() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Active parcel & inputs
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(35);
  const [previousIrrigation, setPreviousIrrigation] = useState(62.3);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // History & Notifications
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  // Load parcels on mount
  useEffect(() => {
    fetchParcels();
  }, []);

  async function fetchParcels() {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/recommendation/parcels");
      setParcels(data);
    } catch (err) {
      setError(err.message || "Impossible de charger les parcelles.");
    } finally {
      setLoading(false);
    }
  }

  // Load history for selected parcel
  async function fetchHistory(parcelId) {
    try {
      setLoadingHistory(true);
      const data = await apiRequest(`/recommendation/history/${parcelId}`);
      setHistory(data);

      // If history has items, set predictionResult to match the latest history entry
      if (data && data.length > 0) {
        const latest = data[0];
        setPredictionResult({
          prediction: latest.prediction,
          confidence: latest.confidence,
          recommendation_message: getRecommendationMessage(latest.prediction),
          timestamp: latest.predicted_at,
          weather: {
            temperature: latest.temperature,
            humidity: latest.humidity,
            rainfall: latest.rainfall,
            wind_speed: latest.wind_speed,
            sunlight_hours: latest.sunlight_hours,
          },
        });
      } else {
        setPredictionResult(null);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  function getRecommendationMessage(pred) {
    const p = pred.toUpperCase();
    if (p === "HIGH") return "Irrigation is recommended today.";
    if (p === "MEDIUM") return "Monitor the soil before irrigating.";
    return "No irrigation required today.";
  }

  const selectedParcel = parcels.find(
    (p) => p.id_parcelle === selectedParcelId,
  );

  // When selected parcel changes
  const handleParcelSelect = (parcelId) => {
    if (selectedParcelId === parcelId) {
      // Toggle collapse
      setSelectedParcelId(null);
      setPredictionResult(null);
      setHistory([]);
      setActiveNotification(null);
    } else {
      setSelectedParcelId(parcelId);
      setPredictionResult(null);
      setHistory([]);
      setActiveNotification(null);
      fetchHistory(parcelId);
    }
  };

  // Run prediction
  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedParcelId) return;

    try {
      setPredicting(true);
      setActiveNotification(null);

      const res = await apiRequest("/recommendation/predict", {
        method: "POST",
        body: JSON.stringify({
          parcel_id: selectedParcelId,
          soil_moisture: parseFloat(soilMoisture),
          previous_irrigation: parseFloat(previousIrrigation) || 62.3,
        }),
      });

      setPredictionResult(res);
      setShowModal(true);

      // Check if prediction differs from previous prediction
      if (
        res.previous_prediction &&
        res.previous_prediction !== res.prediction
      ) {
        setActiveNotification({
          parcelName: res.parcel_name,
          oldStatus: res.previous_prediction,
          newStatus: res.prediction,
          time: new Date(res.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }

      // Refresh prediction history & list of parcels to show new badges
      fetchHistory(selectedParcelId);
      // Quietly reload parcels to update badges in the main list
      const updatedParcels = await apiRequest("/recommendation/parcels");
      setParcels(updatedParcels);
    } catch (err) {
      alert(err.message || "Prediction failed");
    } finally {
      setPredicting(false);
    }
  };

  // Helper colors
  const getPredictionColorClass = (pred) => {
    if (!pred) return "bg-slate-100 text-slate-500 border-slate-200";
    const p = pred.toUpperCase();
    if (p === "HIGH")
      return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10";
    if (p === "MEDIUM")
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10";
    return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10";
  };

  const getPredictionBadge = (pred) => {
    if (!pred) return "Aucune prédiction";
    return pred.toUpperCase();
  };

  // Formatter for timestamps
  const formatWeatherTime = (timestamp) => {
    if (!timestamp) return "Non disponible";
    const date = new Date(timestamp);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return isToday
      ? `Today ${timeStr}`
      : `${date.toLocaleDateString()} ${timeStr}`;
  };

  return (
    <>
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-0">
        {/* ── Header ── */}
        <div className="flex flex-col gap-1 rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-soft backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
              <Sprout className="h-4. w-4." />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
              Module IA
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Smart Irrigation Recommendation
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
            Predict irrigation need using AI and today's weather conditions.
            Click a parcel below to calculate needs.
          </p>
        </div>

        {/* ── Main Loading / Error states ── */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
            <p className="text-sm font-semibold text-slate-500">
              Chargement des parcelles...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <h3 className="mt-3 text-lg font-bold">Erreur de chargement</h3>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchParcels}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Réessayer
            </button>
          </div>
        ) : parcels.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/40 px-6 py-16 text-center shadow-soft">
            <MapPin className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-xl font-bold text-slate-800">
              Aucune parcelle disponible
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              Vous devez ajouter des parcelles et configurer leur profil
              agricole dans l'onglet Parcelles pour pouvoir générer des
              recommandations d'irrigation.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Parcels Grid/List ── */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <span>My Parcels</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {parcels.length}
                </span>
              </h2>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {parcels.map((parcel, idx) => {
                  const isSelected = selectedParcelId === parcel.id_parcelle;
                  const status =
                    parcel.latest_prediction?.prediction?.toUpperCase();

                  // Dynamic colors based on prediction status
                  const theme = {
                    HIGH: {
                      blob: "bg-rose-400/20 group-hover:bg-rose-400/30",
                      border: "border-rose-200/50 hover:border-rose-300",
                      badge: "bg-rose-500 text-white shadow-rose-200",
                      text: "text-rose-600",
                      dot: "bg-rose-200 animate-ping",
                      glow: "shadow-rose-100",
                      ring: "ring-2 ring-rose-500/50",
                      shadow: "shadow-rose-100",
                    },
                    MEDIUM: {
                      blob: "bg-amber-400/15 group-hover:bg-amber-400/25",
                      border: "border-amber-200/50 hover:border-amber-300",
                      badge: "bg-amber-500 text-white shadow-amber-200",
                      text: "text-amber-600",
                      dot: "bg-amber-200",
                      glow: "shadow-amber-100",
                      ring: "ring-2 ring-amber-500/50",
                      shadow: "shadow-amber-100",
                    },
                    LOW: {
                      blob: "bg-emerald-400/15 group-hover:bg-emerald-400/25",
                      border: "border-emerald-200/50 hover:border-emerald-300",
                      badge: "bg-emerald-500 text-white shadow-emerald-200",
                      text: "text-emerald-600",
                      dot: "bg-emerald-200",
                      glow: "shadow-emerald-100",
                      ring: "ring-2 ring-emerald-500/50",
                      shadow: "shadow-emerald-100",
                    },
                  }[status] || {
                    blob: "bg-cyan-400/10 group-hover:bg-cyan-400/20",
                    border: "border-slate-200/80 hover:border-slate-300",
                    badge: "bg-slate-500 text-white shadow-slate-200",
                    text: "text-slate-500",
                    dot: "bg-slate-200",
                    glow: "shadow-slate-100",
                  };

                  return (
                    <motion.article
                      key={parcel.id_parcelle}
                      variants={itemVariants}
                      onClick={() => handleParcelSelect(parcel.id_parcelle)}
                      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
                        isSelected
                          ? `${theme.ring} ${theme.border} bg-gradient-to-b from-white/50 to-cyan-50/20 shadow-xl scale-[1.03] ${theme.shadow}`
                          : `bg-white/50 ${theme.border} hover:shadow-xl hover:scale-[1.01]`
                      }`}
                    >
                      {/* Futuristic Glassmorphic Background Blur Blob */}
                      <div
                        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl transition-all duration-500 ${theme.blob}`}
                      />

                      {/* Index Number Watermark */}
                      <span className="absolute right-6 top-6 text-7xl font-black text-slate-100/80 select-none pointer-events-none group-hover:text-slate-200/40 transition-colors duration-300">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="space-y-4 relative z-10">
                        {/* Top Row: Status badge & Size indicator */}
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                            <Layers className="h-3.5 w-3.5 text-slate-500" />
                            {parcel.superficie} ha
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${theme.badge}`}
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              {status === "HIGH" && (
                                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-white animate-ping" />
                              )}
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                            </span>
                            {getPredictionBadge(status)}
                          </span>
                        </div>

                        {/* Title and Secondary info */}
                        <div className="pt-2">
                          <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-cyan-600 transition-colors duration-300">
                            {parcel.nom}
                          </h3>
                        </div>

                        {/* Technical Specs Glass Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="flex flex-col rounded-2xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100/80 p-3 transition-colors">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              Culture
                            </span>
                            <span className="mt-1 font-black text-slate-700 flex items-center gap-1.5 truncate">
                              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <Sprout className="h-3 w-3" />
                              </span>
                              {parcel.crop_type || "N/A"}
                            </span>
                          </div>

                          <div className="flex flex-col rounded-2xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100/80 p-3 transition-colors">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              Sol
                            </span>
                            <span className="mt-1 font-black text-slate-700 flex items-center gap-1.5 truncate">
                              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Layers className="h-3 w-3" />
                              </span>
                              {parcel.soil_type || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Futuristic Bottom CTA */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 relative z-10">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold"></div>

                        <span className="flex items-center gap-1 text-xs font-black text-cyan-600 group-hover:gap-2 transition-all duration-300">
                          {isSelected ? "Masquer" : "Consulter"}
                          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            </div>

            {/* ── Active Parcel Detailed Recommendation Block ── */}
            <AnimatePresence mode="wait">
              {selectedParcelId && selectedParcel && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={detailVariants}
                  className="space-y-8"
                >
                  {/* ── Status Changed Notification Card ── */}
                  {activeNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-cyan-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-slate-900">
                            Status changed for {activeNotification.parcelName}
                          </h4>
                          <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-2">
                            Status changed from
                            <span className="font-bold uppercase text-slate-500">
                              {activeNotification.oldStatus}
                            </span>
                            <span className="text-cyan-500">→</span>
                            <span
                              className={`font-bold uppercase px-2 py-0.5 rounded text-xs border ${getPredictionColorClass(activeNotification.newStatus)}`}
                            >
                              {activeNotification.newStatus}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 shrink-0 bg-white/80 border border-slate-100 px-3 py-1 rounded-full">
                        {activeNotification.time}
                      </span>
                    </motion.div>
                  )}

                  <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Form Controls and Weather */}
                    <div className="space-y-8 lg:col-span-2">
                      {/* Today's Weather Cards */}
                      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft space-y-6">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              Today's Weather
                            </h3>
                            <p className="text-xs text-slate-500">
                              Fetch weather conditions directly from Open-Meteo
                              API.
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/50 px-3 py-1 text-[11px] font-semibold text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              Weather Updated:{" "}
                              {formatWeatherTime(predictionResult?.timestamp)}
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                          {/* Temperature */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between min-h-[110px]">
                            <span className="p-1.5 self-start rounded-lg bg-orange-50 text-orange-600">
                              <Thermometer className="h-4.5 w-4.5" />
                            </span>
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Temp
                              </p>
                              <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                                {predictionResult
                                  ? `${predictionResult.weather.temperature} °C`
                                  : "--"}
                              </h4>
                            </div>
                          </div>

                          {/* Humidity */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between min-h-[110px]">
                            <span className="p-1.5 self-start rounded-lg bg-blue-50 text-blue-600">
                              <Droplets className="h-4.5 w-4.5" />
                            </span>
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Humidity
                              </p>
                              <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                                {predictionResult
                                  ? `${predictionResult.weather.humidity} %`
                                  : "--"}
                              </h4>
                            </div>
                          </div>

                          {/* Rainfall */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between min-h-[110px]">
                            <span className="p-1.5 self-start rounded-lg bg-cyan-50 text-cyan-600">
                              <CloudRain className="h-4.5 w-4.5" />
                            </span>
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Rainfall
                              </p>
                              <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                                {predictionResult
                                  ? `${predictionResult.weather.rainfall} mm`
                                  : "--"}
                              </h4>
                            </div>
                          </div>

                          {/* Wind speed */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between min-h-[110px]">
                            <span className="p-1.5 self-start rounded-lg bg-teal-50 text-teal-600">
                              <Wind className="h-4.5 w-4.5" />
                            </span>
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Wind
                              </p>
                              <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                                {predictionResult
                                  ? `${predictionResult.weather.wind_speed} km/h`
                                  : "--"}
                              </h4>
                            </div>
                          </div>

                          {/* Sunlight hours */}
                          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between min-h-[110px] col-span-2 sm:col-span-1">
                            <span className="p-1.5 self-start rounded-lg bg-amber-50 text-amber-500">
                              <Sun className="h-4.5 w-4.5" />
                            </span>
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Sunlight
                              </p>
                              <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                                {predictionResult
                                  ? `${predictionResult.weather.sunlight_hours} h`
                                  : "--"}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Soil Moisture Slider Input */}
                      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Soil Moisture
                          </h3>
                          <p className="text-xs text-slate-500">
                            Enter the current measured soil moisture level for
                            this parcel.
                          </p>
                        </div>

                        <div className="flex flex-col gap-6 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <Gauge className="h-4 w-4 text-cyan-600" />
                              Soil Moisture Value
                            </span>
                            <span className="rounded-full bg-cyan-600 px-4 py-1 text-lg font-extrabold text-white">
                              {soilMoisture}%
                            </span>
                          </div>

                          <div className="relative mt-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={soilMoisture}
                              onChange={(e) => setSoilMoisture(e.target.value)}
                              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600 outline-none transition"
                            />
                            <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400 px-1">
                              <span>0% (Extrêmement Sec)</span>
                              <span>50%</span>
                              <span>100% (Saturé)</span>
                            </div>
                          </div>
                        </div>

                        {/* Previous Irrigation Input */}
                        <div className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              Previous Irrigation Applied
                            </span>
                            <span className="rounded-full bg-blue-600 px-4 py-1 text-lg font-extrabold text-white">
                              {previousIrrigation} mm
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Amount of water applied during the last irrigation
                            session (in mm).
                          </p>
                          <input
                            type="number"
                            min="0"
                            max="500"
                            step="0.1"
                            value={previousIrrigation}
                            onChange={(e) =>
                              setPreviousIrrigation(e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            placeholder="e.g. 62.3"
                          />
                        </div>

                        {/* Predict Action Button */}
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            disabled={predicting}
                            onClick={handlePredict}
                            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-cyan-600 px-10 py-4 font-bold text-white shadow-[0_12px_28px_rgba(8,145,178,0.25)] transition-all hover:scale-[1.02] hover:bg-cyan-700 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 min-w-[200px]"
                          >
                            {predicting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Calcul en cours...</span>
                              </>
                            ) : (
                              <>
                                <span>Lancer la Prédiction</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Prediction Results & Confidence Badge */}
                    <div className="space-y-8">
                      {/* Prediction Result Display */}
                      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft space-y-6">
                        <h3 className="text-lg font-bold text-slate-900">
                          Prediction Result
                        </h3>

                        {predictionResult ? (
                          <div className="flex flex-col gap-6 text-center">
                            {/* Badge output */}
                            <div
                              className={`mx-auto rounded-3xl border bg-white/40 p-8 shadow-sm backdrop-blur-md w-full max-w-[240px] flex flex-col items-center justify-center relative overflow-hidden`}
                            >
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Besoin d'irrigation
                              </p>
                              <h4
                                className={`mt-3 text-4xl font-extrabold tracking-tight uppercase ${
                                  predictionResult.prediction === "HIGH"
                                    ? "text-rose-600"
                                    : predictionResult.prediction === "MEDIUM"
                                      ? "text-amber-500"
                                      : "text-emerald-600"
                                }`}
                              >
                                {predictionResult.prediction}
                              </h4>

                              {/* Confidence Gauge */}
                              <div className="mt-4 flex items-center gap-1 bg-slate-100 border border-slate-200/40 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                                <span>Confidence: </span>
                                <span className="text-cyan-700 font-extrabold">
                                  {Math.round(
                                    predictionResult.confidence * 100,
                                  )}
                                  %
                                </span>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                                "{predictionResult.recommendation_message}"
                              </p>
                            </div>

                            {/* View Full Analysis Button */}
                            <button
                              onClick={() => setShowModal(true)}
                              className="group flex items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-bold text-cyan-700 transition-all hover:bg-cyan-600 hover:text-white hover:border-cyan-600 hover:shadow-lg hover:shadow-cyan-200/50"
                            >
                              <BarChart3 className="h-4 w-4" />
                              View Confidence Analysis
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                            <AlertTriangle className="mx-auto h-8 w-8 text-slate-300" />
                            <p className="mt-3 text-sm">
                              Aucune prédiction pour aujourd'hui. Saisissez le
                              taux d'humidité et cliquez sur "Lancer la
                              Prédiction".
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Confidence Analysis Modal ── */}
      <AnimatePresence>
        {showModal && predictionResult && (
          <motion.div
            key="confidence-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backdropFilter: "blur(12px)",
              background: "rgba(15,23,42,0.55)",
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Decorative gradient top bar */}
              <div
                className={`h-1.5 w-full ${
                  predictionResult.prediction === "HIGH"
                    ? "bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500"
                    : predictionResult.prediction === "MEDIUM"
                      ? "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400"
                      : "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                }`}
              />

              {/* Header */}
              <div className="relative px-7 pt-7 pb-5">
                {/* Background blob */}
                <div
                  className={`absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl opacity-20 ${
                    predictionResult.prediction === "HIGH"
                      ? "bg-rose-400"
                      : predictionResult.prediction === "MEDIUM"
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                  }`}
                />

                {/* Close button */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Icon + Title */}
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      predictionResult.prediction === "HIGH"
                        ? "bg-rose-50 text-rose-600"
                        : predictionResult.prediction === "MEDIUM"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      AI Confidence Analysis
                    </p>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">
                      {predictionResult.parcel_name || "Parcel"}
                    </h2>
                  </div>
                </div>

                {/* Hero result chip */}
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-4 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Irrigation Need
                    </p>
                    <p
                      className={`mt-1 text-3xl font-black uppercase tracking-tight ${
                        predictionResult.prediction === "HIGH"
                          ? "text-rose-600"
                          : predictionResult.prediction === "MEDIUM"
                            ? "text-amber-500"
                            : "text-emerald-600"
                      }`}
                    >
                      {predictionResult.prediction}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 italic leading-relaxed">
                      "{predictionResult.recommendation_message}"
                    </p>
                  </div>

                  {/* Radial confidence score */}
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                    <svg
                      className="absolute inset-0 h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke={
                          predictionResult.prediction === "HIGH"
                            ? "#f43f5e"
                            : predictionResult.prediction === "MEDIUM"
                              ? "#f59e0b"
                              : "#10b981"
                        }
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.round(predictionResult.confidence * 97.38)} 97.38`}
                      />
                    </svg>
                    <div className="text-center">
                      <p className="text-lg font-black text-slate-900 leading-none">
                        {Math.round(predictionResult.confidence * 100)}
                        <span className="text-xs font-bold text-slate-400">
                          %
                        </span>
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        conf.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Probability breakdown */}
              <div className="px-7 pb-7 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1">
                  Full Probability Distribution
                </p>

                {(() => {
                  const levels = [
                    {
                      key: "HIGH",
                      label: "High",
                      emoji: "🔴",
                      bar: "from-rose-400 to-rose-600",
                      bg: "bg-rose-50",
                      border: "border-rose-100",
                      text: "text-rose-700",
                      badge: "bg-rose-500",
                    },
                    {
                      key: "MEDIUM",
                      label: "Medium",
                      emoji: "🟡",
                      bar: "from-amber-400 to-amber-500",
                      bg: "bg-amber-50",
                      border: "border-amber-100",
                      text: "text-amber-700",
                      badge: "bg-amber-500",
                    },
                    {
                      key: "LOW",
                      label: "Low",
                      emoji: "🟢",
                      bar: "from-emerald-400 to-teal-500",
                      bg: "bg-emerald-50",
                      border: "border-emerald-100",
                      text: "text-emerald-700",
                      badge: "bg-emerald-500",
                    },
                  ];

                  // Build probabilities from response or fallback
                  const probs = predictionResult.probabilities || {};

                  return levels.map(
                    ({ key, label, emoji, bar, bg, border, text, badge }) => {
                      const pct =
                        probs[key] != null
                          ? Math.round(probs[key] * 100)
                          : null;
                      const isWinner = predictionResult.prediction === key;

                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay:
                              key === "HIGH"
                                ? 0.05
                                : key === "MEDIUM"
                                  ? 0.12
                                  : 0.19,
                          }}
                          className={`relative overflow-hidden rounded-2xl border p-4 ${bg} ${border} ${
                            isWinner
                              ? "ring-2 ring-offset-1 " +
                                (key === "HIGH"
                                  ? "ring-rose-400/50"
                                  : key === "MEDIUM"
                                    ? "ring-amber-400/50"
                                    : "ring-emerald-400/50")
                              : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base leading-none">
                                {emoji}
                              </span>
                              <span className={`text-sm font-black ${text}`}>
                                {label}
                              </span>
                              {isWinner && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white ${badge}`}
                                >
                                  Predicted
                                </span>
                              )}
                            </div>
                            <span className={`text-lg font-black ${text}`}>
                              {pct != null ? `${pct}%` : "—"}
                            </span>
                          </div>

                          {/* Animated progress bar */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/70 shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: pct != null ? `${pct}%` : "0%",
                              }}
                              transition={{
                                duration: 0.7,
                                ease: "easeOut",
                                delay:
                                  key === "HIGH"
                                    ? 0.1
                                    : key === "MEDIUM"
                                      ? 0.18
                                      : 0.25,
                              }}
                              className={`h-full rounded-full bg-gradient-to-r ${bar}`}
                            />
                          </div>
                        </motion.div>
                      );
                    },
                  );
                })()}

                {/* Timestamp footer */}
                <p className="pt-2 text-center text-[10px] font-semibold text-slate-400">
                  Computed{" "}
                  {predictionResult.timestamp
                    ? new Date(predictionResult.timestamp).toLocaleString()
                    : "just now"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
