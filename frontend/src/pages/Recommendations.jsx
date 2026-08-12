import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sprout,
  MapPin,
  Layers,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Sun,
  AlertCircle,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Gauge,
  X,
  BarChart3,
  Zap,
  History,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { apiRequest } from "../services/api";

/* ─── WaterWise brand tokens ──────────────────────────────────────── */
const COLORS = {
  primary: "#0798B8",
  primaryLight: "#16A9CC",
  primaryDark: "#0787A8",
  secondary: "#0EA5E9",
  // bg: "#F4FAFC",
  surfaceSoft: "#EFF9FC",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};

const STATUS_THEME = {
  HIGH: {
    solid: COLORS.high,
    soft: "#FEF2F2",
    softBorder: "#FECDD3",
    text: "#B91C1C",
    gradient: "linear-gradient(145deg, #F87171 0%, #DC2626 60%, #B91C1C 100%)",
    label: "Besoin critique",
    tag: "Besoin élevé",
  },
  MEDIUM: {
    solid: COLORS.medium,
    soft: "#FFFBEB",
    softBorder: "#FDE68A",
    text: "#B45309",
    gradient: "linear-gradient(145deg, #FBBF24 0%, #F59E0B 60%, #D97706 100%)",
    label: "À surveiller",
    tag: "Besoin modéré",
  },
  LOW: {
    solid: COLORS.low,
    soft: "#ECFDF5",
    softBorder: "#A7F3D0",
    text: "#047857",
    gradient: "linear-gradient(145deg, #34D399 0%, #10B981 60%, #047857 100%)",
    label: "État normal",
    tag: "Besoin faible",
  },
  DEFAULT: {
    solid: COLORS.primary,
    soft: COLORS.surfaceSoft,
    softBorder: "#BEE7F0",
    text: COLORS.primaryDark,
    gradient: `linear-gradient(145deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} 60%, ${COLORS.primaryDark} 100%)`,
    label: "En attente d’analyse",
    tag: "Aucune prédiction",
  },
};

function FilterSelect({ value, onChange, options, icon: Icon, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  return (
    <div className="relative" onBlur={() => setIsOpen(false)}>
      <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-aquaBlue" />
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 pl-9 text-left text-sm font-medium text-midnight shadow-sm outline-none transition hover:border-aquaBlue/60 focus:ring-2 focus:ring-aquaBlue/20 ${isOpen ? "border-aquaBlue ring-2 ring-aquaBlue/20" : "border-slate-200"}`}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-aquaBlue" : ""}`} />
      </button>
      {isOpen && (
        <div role="listbox" aria-label={ariaLabel} className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-cyan-200 bg-white p-1.5 shadow-[0_14px_30px_rgba(2,48,71,0.14)]">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${value === option.value ? "bg-cyan-50 font-semibold text-oceanBlue" : "text-slate-700 hover:bg-slate-50 hover:text-oceanBlue"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const getTheme = (status) => STATUS_THEME[status] || STATUS_THEME.DEFAULT;

/* ─── Signature element: liquid droplet gauge ─────────────────────── */
function WaterGauge({ id, percent = 0, color = COLORS.primary, size = 60 }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const top = 2;
  const bottom = 19.5;
  const waterY = bottom - (clamped / 100) * (bottom - top);
  const dropletPath =
    "M12 2.2C12 2.2 4.2 12.6 4.2 17.4a7.8 7.8 0 0 0 15.6 0C19.8 12.6 12 2.2 12 2.2z";

  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <defs>
          <clipPath id={`clip-${id}`}>
            <path d={dropletPath} />
          </clipPath>
          <linearGradient id={`grad-${id}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <path d={dropletPath} fill={COLORS.surfaceSoft} stroke={COLORS.border} strokeWidth="0.6" />
        <g clipPath={`url(#clip-${id})`}>
          <motion.rect
            x="-2"
            width="28"
            height="24"
            fill={`url(#grad-${id})`}
            initial={{ y: bottom }}
            animate={{ y: waterY }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          <motion.path
            d="M-6 0 C -3 -1.4, 0 1.4, 3 0 C 6 -1.4, 9 1.4, 12 0 C 15 -1.4, 18 1.4, 21 0 C 24 -1.4, 27 1.4, 30 0 V 24 H -6 Z"
            fill={color}
            opacity="0.4"
            initial={{ y: bottom }}
            animate={{ x: [-8, 0], y: waterY }}
            transition={{
              x: { repeat: Infinity, duration: 2.4, ease: "linear" },
              y: { duration: 0.9, ease: "easeOut" },
            }}
          />
        </g>
        <path d={dropletPath} fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="0.6" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pt-1">
        <span
          className="text-[11px] font-black leading-none"
          style={{
            color: clamped > 0 ? "#fff" : COLORS.textMuted,
            textShadow: clamped > 30 ? "0 1px 2px rgba(0,0,0,0.25)" : "none",
          }}
        >
          {clamped > 0 ? `${Math.round(clamped)}%` : "—"}
        </span>
      </div>
    </div>
  );
}

/* ─── Animation variants ──────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 110, damping: 16 } },
};

export default function Recommendations() {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [soilMoisture, setSoilMoisture] = useState(35);
  const [previousIrrigation, setPreviousIrrigation] = useState(62.3);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  const [selectedFarm, setSelectedFarm] = useState("ALL");
  const [selectedNeed, setSelectedNeed] = useState("ALL");

  const uniqueFarms = Array.from(
    new Set(parcels.map((p) => p.nom_exploitation).filter(Boolean))
  );

  const filteredParcels = parcels.filter((p) => {
    const matchesFarm = selectedFarm === "ALL" || p.nom_exploitation === selectedFarm;
    const status = p.latest_prediction?.prediction?.toUpperCase();
    const matchesNeed =
      selectedNeed === "ALL" ||
      (selectedNeed === "NONE" && !status) ||
      (selectedNeed !== "NONE" && status === selectedNeed);
    return matchesFarm && matchesNeed;
  });

  const statCounts = ["HIGH", "MEDIUM", "LOW"].map((key) => ({
    key,
    count: parcels.filter((p) => p.latest_prediction?.prediction?.toUpperCase() === key).length,
  }));

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

  async function fetchHistory(parcelId) {
    try {
      setLoadingHistory(true);
      const data = await apiRequest(`/recommendation/history/${parcelId}`);
      setHistory(data);

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
          irrigation: latest.recommended_irrigation_mm != null ? {
            et0_mm: latest.et0_mm, kc: latest.kc, etc_mm: latest.etc_mm,
            effective_rainfall_mm: latest.effective_rainfall_mm,
            net_irrigation_mm: latest.net_irrigation_mm,
            irrigation_efficiency: latest.irrigation_efficiency,
            gross_irrigation_mm: latest.gross_irrigation_mm,
            recommended_irrigation_mm: latest.recommended_irrigation_mm,
            recommended_volume_m3: latest.recommended_volume_m3,
          } : null,
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
    if (p === "HIGH") return "L’irrigation est recommandée aujourd’hui.";
    if (p === "MEDIUM") return "Surveillez le sol avant d’irriguer.";
    return "Aucune irrigation n’est nécessaire aujourd’hui.";
  }

  function translateRecommendationMessage(message, prediction) {
    const normalized = message?.toLowerCase() || "";
    if (normalized.includes("irrigation is recommended")) return "L’irrigation est recommandée aujourd’hui.";
    if (normalized.includes("monitor the soil")) return "Surveillez le sol avant d’irriguer.";
    if (normalized.includes("no irrigation required")) return "Aucune irrigation n’est nécessaire aujourd’hui.";
    return message || getRecommendationMessage(prediction);
  }

  const handleParcelSelect = (parcelId) => {
    if (selectedParcelId === parcelId) {
      setSelectedParcelId(null);
      setPredictionResult(null);
      setHistory([]);
      setActiveNotification(null);
      setPredictionError("");
    } else {
      setSelectedParcelId(parcelId);
      setPredictionResult(null);
      setHistory([]);
      setActiveNotification(null);
      setPredictionError("");
      fetchHistory(parcelId);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedParcelId) return;

    try {
      setPredicting(true);
      setActiveNotification(null);
      setPredictionError("");

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

      if (res.previous_prediction && res.previous_prediction !== res.prediction) {
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

      fetchHistory(selectedParcelId);
      const updatedParcels = await apiRequest("/recommendation/parcels");
      setParcels(updatedParcels);
    } catch (err) {
      setPredictionError(
        err.message?.includes("Open-Meteo")
          ? "Les données météo sont temporairement indisponibles. Vérifiez la connexion au serveur puis réessayez."
          : err.message || "La prédiction a échoué. Veuillez réessayer."
      );
    } finally {
      setPredicting(false);
    }
  };

  const getPredictionBadge = (pred) => {
    if (!pred) return "Aucune prédiction";
    return getTheme(pred.toUpperCase()).tag;
  };

  const formatWeatherTime = (timestamp) => {
    if (!timestamp) return "Non disponible";
    const date = new Date(timestamp);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return isToday ? `Aujourd’hui à ${timeStr}` : `${date.toLocaleDateString("fr-FR")} à ${timeStr}`;
  };

  return (
    <>
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-0" style={{ background: COLORS.bg }}>
        {/* ── Header & Stats Wrapper ── */}
        <section className="relative flex flex-col gap-6 rounded-3xl border border-cyan-200/40 bg-white/40 p-6 shadow-[0_16px_40px_rgba(2,48,71,0.07)] backdrop-blur-md">
          {/* ── Header ── */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <span
                className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]"
                style={{ background: COLORS.surfaceSoft, color: COLORS.primary, borderColor: "#BEE7F0" }}
              >
                <Sprout className="h-3.5 w-3.5" />
                Module IA
              </span>
              <h1 className="mt-1 text-3xl font-semibold" style={{ color: COLORS.primaryDark }}>
                Recommandations d’irrigation intelligentes
              </h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                Évaluez le besoin d’irrigation à partir des données météo du jour. Sélectionnez une parcelle pour lancer l’analyse.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/histrique-recommandations")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,119,182,0.22)]"
              style={{ background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)` }}
            >
              <History className="h-4 w-4" />
              Voir l'historique
            </motion.button>
          </motion.div>

          {/* ── Stats mini-cards ── */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-4">
            {[
              {
                label: "Parcelles",
                value: parcels.length,
                Icon: MapPin,
                iconColor: COLORS.primary,
                iconBg: `${COLORS.primary}18`,
                soft: COLORS.surfaceSoft,
                softBorder: "#BEE7F0",
              },
              {
                label: "Critique",
                value: statCounts.find((s) => s.key === "HIGH")?.count ?? 0,
                Icon: AlertCircle,
                iconColor: COLORS.high,
                iconBg: `${COLORS.high}18`,
                soft: "#FEF2F2",
                softBorder: "#FECDD3",
              },
              {
                label: "Modéré",
                value: statCounts.find((s) => s.key === "MEDIUM")?.count ?? 0,
                Icon: AlertTriangle,
                iconColor: COLORS.medium,
                iconBg: `${COLORS.medium}18`,
                soft: "#FFFBEB",
                softBorder: "#FDE68A",
              },
              {
                label: "Sain",
                value: statCounts.find((s) => s.key === "LOW")?.count ?? 0,
                Icon: Sprout,
                iconColor: COLORS.low,
                iconBg: `${COLORS.low}18`,
                soft: "#ECFDF5",
                softBorder: "#A7F3D0",
              },
            ].map((card) => (
              <motion.div
                key={card.label}
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl border p-5 shadow-[0_4px_16px_rgba(2,48,71,0.06)] backdrop-blur"
                style={{ background: card.soft, borderColor: card.softBorder }}
              >
                <div className="relative z-10 space-y-1">
                  <p className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>{card.label}</p>
                  <p className="text-3xl font-bold leading-none" style={{ color: COLORS.textPrimary }}>{card.value}</p>
                </div>
                <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-40">
                  <div
                    className="flex h-24 w-24 rotate-[-14deg] items-center justify-center rounded-full"
                    style={{ background: card.iconBg }}
                  >
                    <card.Icon className="h-12 w-12" style={{ color: card.iconColor }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Filters ── */}
        <motion.section
          variants={itemVariants}
          initial="hidden"
          animate="show"
          className="rounded-3xl border border-iceBlue bg-arcticWhite p-5 shadow-[0_18px_60px_rgba(2,48,71,0.06)]"
        >
          {/* <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            
            {(selectedFarm !== "ALL" || selectedNeed !== "ALL") && (
              <button
                type="button"
                onClick={() => { setSelectedFarm("ALL"); setSelectedNeed("ALL"); }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-oceanBlue transition hover:bg-iceBlue"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}
          </div> */}

          <div className="grid gap-3 sm:grid-cols-2">
            <FilterSelect
                ariaLabel="Filtrer par exploitation"
                value={selectedFarm}
                onChange={setSelectedFarm}
                icon={MapPin}
                options={[
                  { value: "ALL", label: "Toutes les exploitations" },
                  ...uniqueFarms.map((farm) => ({ value: farm, label: farm })),
                ]}
            />

            <FilterSelect
                ariaLabel="Filtrer par besoin d’irrigation"
                value={selectedNeed}
                onChange={setSelectedNeed}
                icon={Droplets}
                options={[
                  { value: "ALL", label: "Tous les niveaux de besoin" },
                  { value: "HIGH", label: "Besoin élevé" },
                  { value: "MEDIUM", label: "Besoin modéré" },
                  { value: "LOW", label: "Besoin faible" },
                  { value: "NONE", label: "Aucune prédiction" },
                ]}
            />
          </div>
        </motion.section>

        {/* ── Main Loading / Error states ── */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: COLORS.primary }} />
            <p className="text-sm font-semibold" style={{ color: COLORS.textSecondary }}>Chargement des parcelles...</p>
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ borderColor: STATUS_THEME.HIGH.softBorder, background: STATUS_THEME.HIGH.soft, color: STATUS_THEME.HIGH.text }}
          >
            <AlertCircle className="mx-auto h-10 w-10" style={{ color: COLORS.high }} />
            <h3 className="mt-3 text-lg font-bold">Erreur de chargement</h3>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchParcels}
              className="mt-4 rounded-xl px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              style={{ background: COLORS.high }}
            >
              Réessayer
            </button>
          </div>
        ) : parcels.length === 0 ? (
          <div
            className="rounded-3xl border-2 border-dashed px-6 py-16 text-center"
            style={{ borderColor: COLORS.border, background: "rgba(255,255,255,0.4)" }}
          >
            <MapPin className="mx-auto h-12 w-12" style={{ color: COLORS.textMuted }} />
            <h3 className="mt-4 text-xl font-bold" style={{ color: COLORS.textPrimary }}>Aucune parcelle disponible</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: COLORS.textSecondary }}>
              Vous devez ajouter des parcelles et configurer leur profil agricole dans l'onglet Parcelles pour pouvoir générer des recommandations d'irrigation.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Parcels list ── */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-3">
              {filteredParcels.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-12 text-center"
                  style={{ borderColor: COLORS.border, background: "rgba(255,255,255,0.4)" }}
                >
                  <AlertCircle className="mx-auto h-10 w-10" style={{ color: COLORS.textMuted }} />
                  <h3 className="text-base font-bold" style={{ color: COLORS.textPrimary }}>Aucune parcelle correspondante</h3>
                  <p className="max-w-sm text-xs" style={{ color: COLORS.textSecondary }}>
                    No parcels match your farm or irrigation need filters. Try adjusting your selections.
                  </p>
                </div>
              ) : (
                filteredParcels.map((parcel, idx) => {
                  const isSelected = selectedParcelId === parcel.id_parcelle;
                  const status = parcel.latest_prediction?.prediction?.toUpperCase();
                  const theme = getTheme(status);
                  const confidence = parcel.latest_prediction?.confidence;
                  const pct = confidence != null ? Math.round(confidence * 100) : 0;
                  const predictedAt = parcel.latest_prediction?.predicted_at
                    ? new Date(parcel.latest_prediction.predicted_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : null;

                  return (
                    <div key={parcel.id_parcelle} className="flex flex-col">
                      {/* ── CARD ── */}
                      <motion.article
                        variants={itemVariants}
                        onClick={() => handleParcelSelect(parcel.id_parcelle)}
                        whileHover={isSelected ? undefined : { y: -3 }}
                        className="group relative flex cursor-pointer flex-row overflow-hidden border transition-all duration-300"
                        style={{
                          borderColor: isSelected ? theme.solid : COLORS.border,
                          borderWidth: isSelected ? 2 : 1,
                          borderBottomWidth: isSelected ? 0 : 1,
                          borderRadius: isSelected ? "24px 24px 0 0" : "24px",
                          background: "linear-gradient(160deg, #ffffff 65%, #fbfeff 100%)",
                          boxShadow: isSelected ? `0 20px 40px -16px ${theme.solid}55` : "0 1px 2px rgba(15,23,42,0.04)",
                        }}
                      >
                        {/* ── LEFT PANEL ── */}
                        <div className="relative flex w-52 shrink-0 flex-col justify-between overflow-hidden p-5" style={{ background: theme.gradient }}>
                          <div
                            className="pointer-events-none absolute inset-0 opacity-[0.10]"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                            }}
                          />
                          <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                          <span className="pointer-events-none absolute -bottom-2 -right-1 select-none text-9xl font-black leading-none text-white/10">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="relative z-10 space-y-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white ring-1 ring-white/25 backdrop-blur-sm">
                              <span className="relative flex h-1.5 w-1.5">
                                {status === "HIGH" && (
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                                )}
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                              </span>
                              {getPredictionBadge(status)}
                            </span>
                            <h3 className="text-base font-black leading-snug tracking-tight text-white drop-shadow-sm">{parcel.nom}</h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/75">
                              <Layers className="h-3 w-3" />
                              {parcel.superficie} ha
                            </span>
                          </div>
                          <div className="relative z-10 mt-4 flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                            <span className="flex h-4 w-4 items-center justify-center rounded bg-white/15">
                              <MapPin className="h-2.5 w-2.5" />
                            </span>
                            <span className="truncate">Ferme · {parcel.nom_exploitation || "Non spécifiée"}</span>
                          </div>
                        </div>

                        {/* ── CENTER CHIPS ── */}
                        <div className="flex flex-1 flex-col justify-center px-5 py-5">
                          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                            {[
                              { label: "Culture", value: parcel.crop_type, icon: <Sprout className="h-3.5 w-3.5" /> },
                              { label: "Type de Sol", value: parcel.soil_type, icon: <Layers className="h-3.5 w-3.5" /> },
                              { label: "Stade", value: parcel.crop_growth_stage, icon: <Zap className="h-3.5 w-3.5" /> },
                              { label: "Irrigation", value: parcel.irrigation_type, icon: <Droplets className="h-3.5 w-3.5" /> },
                              { label: "pH Sol", value: parcel.soil_ph != null ? parcel.soil_ph.toFixed(1) : null, icon: <Gauge className="h-3.5 w-3.5" /> },
                              { label: "Carbone org.", value: parcel.organic_carbon != null ? `${parcel.organic_carbon}%` : null, icon: <BarChart3 className="h-3.5 w-3.5" /> },
                            ].map(({ label, value, icon }) => (
                              <div
                                key={label}
                                className="flex flex-col gap-1.5 rounded-xl border px-3 py-2.5 shadow-sm transition-all duration-150 hover:shadow"
                                style={{ borderColor: COLORS.border, background: "#fff" }}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                                    style={{ background: COLORS.surfaceSoft, color: COLORS.primaryDark }}
                                  >
                                    {icon}
                                  </span>
                                  <span className="text-[8.5px] font-bold uppercase tracking-widest" style={{ color: COLORS.textMuted }}>
                                    {label}
                                  </span>
                                </div>
                                <p className="truncate pl-0.5 text-[13px] font-bold tracking-tight" style={{ color: value ? COLORS.textPrimary : "#CBD5E1" }}>
                                  {value || "—"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── RIGHT: Water gauge + CTA ── */}
                        <div className="flex w-36 shrink-0 flex-col items-center justify-between border-l px-4 py-5" style={{ borderColor: COLORS.border }}>
                          <div className="flex flex-col items-center gap-1.5">
                            <WaterGauge id={`card-${parcel.id_parcelle}`} percent={pct} color={theme.solid} size={60} />
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: COLORS.textMuted }}>Confiance</p>
                            {predictedAt ? (
                              <div className="flex items-center gap-1 text-[9px]" style={{ color: COLORS.textMuted }}>
                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                {predictedAt}
                              </div>
                            ) : (
                              <p className="text-center text-[9px] font-bold uppercase tracking-widest" style={{ color: "#CBD5E1" }}>Aucune</p>
                            )}
                          </div>
                          <span
                            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black transition-all duration-200"
                            style={
                              isSelected
                                ? { background: theme.gradient, color: "#fff", boxShadow: `0 6px 16px -6px ${theme.solid}80` }
                                : { background: COLORS.surfaceSoft, color: COLORS.primaryDark }
                            }
                          >
                            {isSelected ? "Fermer" : "Ouvrir"}
                            <ArrowRight className={`h-3 w-3 transition-transform duration-200 ${isSelected ? "rotate-90" : "group-hover:translate-x-0.5"}`} />
                          </span>
                        </div>
                      </motion.article>

                      {/* ── ACCORDION DRAWER ── */}
                      <AnimatePresence initial={false}>
                        {isSelected && (
                          <motion.div
                            key="drawer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div
                              className="p-6"
                              style={{
                                borderLeft: `2px solid ${theme.solid}`,
                                borderRight: `2px solid ${theme.solid}`,
                                borderBottom: `2px solid ${theme.solid}`,
                                borderRadius: "0 0 24px 24px",
                                background: "rgba(255,255,255,0.85)",
                                backdropFilter: "blur(6px)",
                              }}
                            >
                              {loadingHistory ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-8">
                                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: COLORS.textMuted }} />
                                  <p className="text-xs font-semibold" style={{ color: COLORS.textMuted }}>Chargement...</p>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {activeNotification && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                      style={{ borderColor: COLORS.surfaceSoft, background: "rgba(239,250,252,0.5)" }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" style={{ color: COLORS.primary }} />
                                        <p className="text-xs font-semibold" style={{ color: COLORS.textPrimary }}>
                                          Status changé de <strong>{activeNotification.oldStatus}</strong> →{" "}
                                          <span
                                            className="rounded px-1.5 py-0.5 text-[10px] font-black uppercase"
                                            style={{
                                              background: getTheme(activeNotification.newStatus).soft,
                                              color: getTheme(activeNotification.newStatus).text,
                                              border: `1px solid ${getTheme(activeNotification.newStatus).softBorder}`,
                                            }}
                                          >
                                            {activeNotification.newStatus}
                                          </span>
                                        </p>
                                      </div>
                                      <span className="shrink-0 rounded-full border bg-white px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: COLORS.border, color: COLORS.textMuted }}>
                                        {activeNotification.time}
                                      </span>
                                    </motion.div>
                                  )}

                                  <div className="grid gap-5 md:grid-cols-2">
                                    {/* ── LEFT: Inputs ── */}
                                    <div className="space-y-4 rounded-2xl border p-5 shadow-sm" style={{ borderColor: COLORS.border, background: "#fff" }}>
                                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: COLORS.textMuted }}>Paramètres</h4>

                                      <div className="space-y-2 rounded-xl border p-3.5" style={{ borderColor: COLORS.border, background: COLORS.surfaceSoft }}>
                                        <div className="flex items-center justify-between">
                                          <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: COLORS.textPrimary }}>
                                            <Gauge className="h-3.5 w-3.5" style={{ color: COLORS.primary }} />
                                            Humidité du sol
                                          </span>
                                          <span className="rounded-md px-2 py-0.5 text-xs font-black text-white" style={{ background: COLORS.primaryDark }}>
                                            {soilMoisture}%
                                          </span>
                                        </div>
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          step="1"
                                          value={soilMoisture}
                                          onChange={(e) => setSoilMoisture(e.target.value)}
                                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
                                          style={{ background: COLORS.border, accentColor: COLORS.primary }}
                                        />
                                        <div className="flex justify-between text-[9px] font-bold" style={{ color: COLORS.textMuted }}>
                                          <span>Sec (0%)</span>
                                          <span>50%</span>
                                          <span>Saturé (100%)</span>
                                        </div>
                                      </div>

                                      <div className="space-y-2 rounded-xl border p-3.5" style={{ borderColor: COLORS.border, background: COLORS.surfaceSoft }}>
                                        <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: COLORS.textPrimary }}>
                                          <Droplets className="h-3.5 w-3.5" style={{ color: COLORS.primary }} />
                                          Irrigation précédente (mm)
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          max="500"
                                          step="0.1"
                                          value={previousIrrigation}
                                          onChange={(e) => setPreviousIrrigation(e.target.value)}
                                          className="w-full rounded-lg border bg-white px-3 py-2 text-xs font-semibold outline-none transition"
                                          style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                                          placeholder="ex: 62.3"
                                        />
                                      </div>

                                      {predictionError && (
                                        <div
                                          className="flex items-start gap-2 rounded-xl border p-3"
                                          style={{ borderColor: STATUS_THEME.MEDIUM.softBorder, background: STATUS_THEME.MEDIUM.soft }}
                                        >
                                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: COLORS.medium }} />
                                          <p className="text-[11px]" style={{ color: STATUS_THEME.MEDIUM.text }}>{predictionError}</p>
                                        </div>
                                      )}

                                      <button
                                        type="button"
                                        disabled={predicting}
                                        onClick={handlePredict}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
                                        style={{
                                          background: `linear-gradient(120deg, ${COLORS.primary}, ${COLORS.secondary})`,
                                          boxShadow: `0 10px 24px -10px ${COLORS.primary}80`,
                                        }}
                                      >
                                        {predicting ? (
                                          <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Calcul...</span>
                                          </>
                                        ) : (
                                          <>
                                            <span>Lancer la Prédiction</span>
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    {/* ── RIGHT: Results ── */}
                                    <div className="space-y-4">
                                      <div className="space-y-4 rounded-2xl border p-5 shadow-sm" style={{ borderColor: COLORS.border, background: "#fff" }}>
                                        <h4 className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: COLORS.textMuted }}>Résultat de l'Analyse</h4>
                                        {predictionResult ? (
                                          <div className="space-y-3">
                                            <div
                                              className="flex items-center justify-between rounded-xl border px-4 py-3"
                                              style={{
                                                borderColor: getTheme(predictionResult.prediction).softBorder,
                                                background: getTheme(predictionResult.prediction).soft,
                                              }}
                                            >
                                              <div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Besoin d'irrigation</p>
                                                <p className="mt-1 text-xl font-black uppercase tracking-tight" style={{ color: getTheme(predictionResult.prediction).text }}>
                                                  {getTheme(predictionResult.prediction).tag}
                                                </p>
                                              </div>
                                              <WaterGauge
                                                id="drawer-result"
                                                percent={Math.round(predictionResult.confidence * 100)}
                                                color={getTheme(predictionResult.prediction).solid}
                                                size={52}
                                              />
                                            </div>
                                            <p className="px-1 text-[11px] italic" style={{ color: COLORS.textSecondary }}>
                                              "{translateRecommendationMessage(predictionResult.recommendation_message, predictionResult.prediction)}"
                                            </p>

                                            {predictionResult.prediction === "MEDIUM" && predictionResult.probabilities && (
                                              <div className="flex gap-2 rounded-xl border p-2.5" style={{ borderColor: COLORS.border, background: COLORS.surfaceSoft }}>
                                                <div className="flex-1 py-0.5 text-center">
                                                  <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Besoin faible</p>
                                                  <p className="mt-0.5 text-xs font-black" style={{ color: COLORS.low }}>
                                                    {predictionResult.probabilities.LOW != null ? `${Math.round(predictionResult.probabilities.LOW * 100)}%` : "—"}
                                                  </p>
                                                </div>
                                                <div className="my-1 w-[1px] self-stretch" style={{ background: COLORS.border }} />
                                                <div className="flex-1 py-0.5 text-center">
                                                  <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Besoin élevé</p>
                                                  <p className="mt-0.5 text-xs font-black" style={{ color: COLORS.high }}>
                                                    {predictionResult.probabilities.HIGH != null ? `${Math.round(predictionResult.probabilities.HIGH * 100)}%` : "—"}
                                                  </p>
                                                </div>
                                              </div>
                                            )}

                                            <button
                                              onClick={() => setShowModal(true)}
                                              className="group flex w-full items-center justify-center gap-1.5 rounded-xl border bg-white py-2.5 text-xs font-bold transition hover:shadow-sm"
                                              style={{ borderColor: COLORS.border, color: COLORS.textPrimary }}
                                            >
                                              <BarChart3 className="h-3.5 w-3.5" style={{ color: COLORS.primary }} />
                                              Voir l'analyse complète
                                              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: COLORS.border }}>
                                            <AlertTriangle className="mx-auto h-6 w-6" style={{ color: "#CBD5E1" }} />
                                            <p className="mt-2 text-[11px] leading-relaxed" style={{ color: COLORS.textMuted }}>
                                              Saisissez l'humidité et lancez l'analyse.
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Weather strip */}
                                      <div className="rounded-2xl border p-4 shadow-sm" style={{ borderColor: COLORS.border, background: "#fff" }}>
                                        <div className="mb-3 flex items-center justify-between">
                                          <h4 className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: COLORS.textMuted }}>Météo du Jour</h4>
                                          <span className="text-[9px]" style={{ color: COLORS.textMuted }}>{formatWeatherTime(predictionResult?.timestamp)}</span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-1.5">
                                          {[
                                            { label: "Temp", value: predictionResult ? `${predictionResult.weather.temperature}°C` : "--", icon: <Thermometer className="h-3.5 w-3.5" /> },
                                            { label: "Humid", value: predictionResult ? `${predictionResult.weather.humidity}%` : "--", icon: <Droplets className="h-3.5 w-3.5" /> },
                                            { label: "Pluie", value: predictionResult ? `${predictionResult.weather.rainfall}mm` : "--", icon: <CloudRain className="h-3.5 w-3.5" /> },
                                            { label: "Vent", value: predictionResult ? `${predictionResult.weather.wind_speed}km/h` : "--", icon: <Wind className="h-3.5 w-3.5" /> },
                                            { label: "Soleil", value: predictionResult ? `${predictionResult.weather.sunlight_hours}h` : "--", icon: <Sun className="h-3.5 w-3.5" /> },
                                          ].map(({ label, value, icon }) => (
                                            <div key={label} className="flex flex-col items-center rounded-lg border p-2 text-center" style={{ borderColor: COLORS.border, background: COLORS.surfaceSoft }}>
                                              <span className="mb-1" style={{ color: COLORS.primary }}>{icon}</span>
                                              <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>{label}</span>
                                              <span className="mt-0.5 text-[11px] font-bold" style={{ color: COLORS.textPrimary }}>{value}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </motion.div>
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
            style={{ backdropFilter: "blur(12px)", background: "rgba(15,23,42,0.55)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-lg overflow-hidden rounded-[2rem] border bg-[#f8fcfd] shadow-[0_28px_80px_rgba(2,48,71,0.28)]"
              style={{ borderColor: "#bde8ef" }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white p-3.5 shadow-sm">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: getTheme(predictionResult.prediction).soft, color: getTheme(predictionResult.prediction).text }}
                  >
                    <Sprout className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-cyan-700">Diagnostic d’irrigation IA</p>
                    <h2 className="mt-0.5 text-xl font-black tracking-tight" style={{ color: COLORS.textPrimary }}>{predictionResult.parcel_name || "Parcelle"}</h2>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: COLORS.textMuted }}>
                      <MapPin className="h-3 w-3 text-cyan-600" /> Analyse agronomique
                    </p>
                  </div>
                </div>

                

                {/* Hero Result Section */}
                <div
                  className="relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl border p-5 shadow-sm"
                  style={{ borderColor: getTheme(predictionResult.prediction).softBorder, background: getTheme(predictionResult.prediction).soft }}
                >
                  <div className="relative z-10 flex-1 space-y-1.5">
                    <p
                      className="text-3xl font-black uppercase tracking-tight sm:text-4xl"
                      style={{ color: getTheme(predictionResult.prediction).text }}
                    >
                      {getTheme(predictionResult.prediction).tag}
                    </p>
                    <h3 className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: COLORS.textMuted }}>Besoin d’irrigation · {Math.round(predictionResult.confidence * 100)} % de confiance</h3>
                    <p className="max-w-[290px] text-sm font-medium leading-relaxed" style={{ color: COLORS.textSecondary }}>
                      "{translateRecommendationMessage(predictionResult.recommendation_message, predictionResult.prediction)}"
                    </p>
                  </div>

                  <div className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-32 rounded-full border-[18px] opacity-20" style={{ borderColor: getTheme(predictionResult.prediction).solid }} />

                  <WaterGauge
                    id="modal-hero"
                    percent={Math.round(predictionResult.confidence * 100)}
                    color={getTheme(predictionResult.prediction).solid}
                    size={84}
                  />
                </div>

                {predictionResult.irrigation && (
                  <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-[#e4f8fb] via-white to-white p-5 shadow-[0_12px_30px_rgba(7,152,184,0.08)] sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-cyan-700">Eau recommandée</p>
                      <Droplets className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-5xl font-black leading-none tracking-tight text-slate-900">
                          {Number(predictionResult.irrigation.recommended_irrigation_mm).toFixed(1)} mm
                        </p>
                        <p className="mt-2 text-sm font-bold text-cyan-700">
                          ≈ {Number(predictionResult.irrigation.recommended_volume_m3).toFixed(1)} m³
                        </p>
                      </div>
                      <p className="max-w-[130px] text-right text-[10px] leading-relaxed text-slate-500">
                        Besoin estimé pour cette parcelle
                      </p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Irrigation précédente</p>
                        <p className="mt-1 text-xl font-black text-slate-800">
                          {predictionResult.previous_irrigation != null
                            ? `${Number(predictionResult.previous_irrigation).toFixed(1)} mm`
                            : `${Number(previousIrrigation).toFixed(1)} mm`}
                        </p>
                        <p className="text-[10px] text-slate-400">Saisie de l’agriculteur</p>
                      </div>
                      <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-3">
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-cyan-600">Volume recommandé</p>
                        <p className="mt-1 text-xl font-black text-cyan-800">{Number(predictionResult.irrigation.recommended_volume_m3).toFixed(1)} m³</p>
                        <p className="text-[10px] text-cyan-600">Pour cette parcelle</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-widest text-white transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: getTheme(predictionResult.prediction).gradient,
                    boxShadow: `0 12px 28px -10px ${getTheme(predictionResult.prediction).solid}80`,
                  }}
                >
                  Fermer le Diagnostic
                </button>

                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
