import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Filter,
  ArrowUpDown,
  FileText,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  Eye,
  X,
} from "lucide-react";
import { apiRequest } from "../services/api";
import { FilterDropdown } from "../components/parcels/ParcelFilters";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function HistoryRecommendations() {
  const navigate = useNavigate();
  const [parcels, setParcels] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  // const [searchQuery, setSearchQuery] = useState("");
  const [selectedParcelFilter, setSelectedParcelFilter] = useState("all");
  const [selectedPredictionFilter, setSelectedPredictionFilter] =
    useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc' for predicted_at
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setSelectedRecord(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      // 1. Fetch all parcels
      const parcelsData = await apiRequest("/recommendation/parcels");
      setParcels(parcelsData);

      // 2. Fetch history for all parcels in parallel
      const historyPromises = parcelsData.map(async (p) => {
        try {
          const historyData = await apiRequest(
            `/recommendation/history/${p.id_parcelle}`,
          );
          return historyData.map((record) => ({
            ...record,
            parcelName: p.nom,
            cropType: p.crop_type,
            soilType: p.soil_type,
            id_parcelle: p.id_parcelle,
            superficie: p.superficie,
          }));
        } catch (err) {
          console.error(
            `Failed to load history for parcel ${p.id_parcelle}:`,
            err,
          );
          return [];
        }
      });

      const allHistoryResults = await Promise.all(historyPromises);
      const flatHistory = allHistoryResults
        .flat()
        .sort((a, b) => new Date(b.predicted_at) - new Date(a.predicted_at));

      setAllHistory(flatHistory);
    } catch (err) {
      setError(err.message || "Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  }

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
    if (!pred) return "Aucune";
    const labels = { HIGH: "Besoin élevé", MEDIUM: "Besoin modéré", LOW: "Besoin faible" };
    return labels[pred.toUpperCase()] || pred.toUpperCase();
  };

  // Filter & Sort Logic
  const filteredHistory = allHistory
    .filter((item) => {
      // 2. Parcel Filter
      const matchesParcel =
        selectedParcelFilter === "all" ||
        String(item.id_parcelle) === selectedParcelFilter;

      // 3. Prediction Filter
      const matchesPrediction =
        selectedPredictionFilter === "all" ||
        item.prediction.toUpperCase() ===
          selectedPredictionFilter.toUpperCase();

      const dateWindow = { "24h": 1, "7d": 7, "30d": 30 }[selectedDateFilter];
      const matchesDate = !dateWindow || (Date.now() - new Date(item.predicted_at).getTime()) <= dateWindow * 24 * 60 * 60 * 1000;

      return matchesParcel && matchesPrediction && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.predicted_at).getTime();
      const dateB = new Date(b.predicted_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const groupedHistory = filteredHistory.reduce((groups, record) => {
    const key = new Date(record.predicted_at).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
    return groups;
  }, {});

  const getRecommendationText = (prediction) => {
    const labels = {
      HIGH: "Irrigation recommandée aujourd’hui",
      MEDIUM: "Surveillez le sol avant d’irriguer",
      LOW: "Aucune irrigation immédiate nécessaire",
    };
    return labels[prediction?.toUpperCase()] || "Analyse disponible";
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-1 rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-soft backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
            <History className="h-4.5 w-4.5" />
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
            Historique complet
          </p>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Historique des recommandations
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
          Visualisez, recherchez et filtrez l'historique complet de toutes les
          prédictions d'irrigation générées par l'IA.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
          <p className="text-sm font-semibold text-slate-500">
            Chargement de l'historique...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h3 className="mt-3 text-lg font-bold">Erreur de chargement</h3>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-700"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="rounded-3xl border border-iceBlue bg-arcticWhite p-5 shadow-[0_18px_60px_rgba(2,48,71,0.06)]">
            {/* <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-iceBlue text-oceanBlue">
                <Filter className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oceanBlue">Filtres</p>
                <p className="mt-0.5 text-sm text-midnight/60">Affinez l’historique des recommandations</p>
              </div>
            </div> */}
            <div className="grid items-center gap-3 md:grid-cols-4">

            {/* Parcel Select Filter */}
            <div className="relative">
              <span className="hidden">
                <Filter className="h-4 w-4" />
              </span>
              <FilterDropdown
                id="history-parcel-filter"
                value={selectedParcelFilter}
                onChange={setSelectedParcelFilter}
                ariaLabel="Filtrer par parcelle"
                icon={Filter}
                options={[
                  { value: "all", label: "Toutes les parcelles" },
                  ...parcels.map((p) => ({ value: String(p.id_parcelle), label: p.nom })),
                ]}
              />
              <select
                value={selectedParcelFilter}
                onChange={(e) => setSelectedParcelFilter(e.target.value)}
                className="hidden"
              >
                <option value="all">Toutes les parcelles</option>
                {parcels.map((p) => (
                  <option key={p.id_parcelle} value={p.id_parcelle}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Prediction Filter */}
            <div className="relative">
              <span className="hidden">
                <Droplets className="h-4 w-4" />
              </span>
              <FilterDropdown
                id="history-prediction-filter"
                value={selectedPredictionFilter}
                onChange={setSelectedPredictionFilter}
                ariaLabel="Filtrer par décision"
                icon={Droplets}
                options={[
                  { value: "all", label: "Toutes les décisions" },
                  { value: "high", label: "Besoin élevé · irrigation nécessaire" },
                  { value: "medium", label: "Besoin modéré · surveillance" },
                  { value: "low", label: "Besoin faible · aucune irrigation" },
                ]}
              />
              <select
                value={selectedPredictionFilter}
                onChange={(e) => setSelectedPredictionFilter(e.target.value)}
                className="hidden"
              >
                <option value="all">Toutes les décisions</option>
                <option value="high">HIGH (Irrigation nécessaire)</option>
                <option value="medium">MEDIUM (Surveillance)</option>
                <option value="low">LOW (Aucune irrigation)</option>
              </select>
            </div>

            <FilterDropdown
              id="history-date-filter"
              value={selectedDateFilter}
              onChange={setSelectedDateFilter}
              ariaLabel="Filtrer par période"
              icon={Calendar}
              options={[
                { value: "all", label: "Toute la période" },
                { value: "24h", label: "Dernières 24 heures" },
                { value: "7d", label: "Derniers 7 jours" },
                { value: "30d", label: "Derniers 30 jours" },
              ]}
            />

            {/* Sort Toggle Button */}
            <button
              onClick={toggleSortOrder}
              className="flex w-full items-center justify-between rounded-xl border border-iceBlue bg-white px-4 py-2.5 text-sm text-midnight shadow-sm transition hover:border-aquaBlue/60 hover:bg-cyan-50/30 focus:outline-none focus:ring-2 focus:ring-aquaBlue/20"
            >
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-cyan-600" />
                <span>Trier par date</span>
              </span>
              <span className="text-xs font-bold text-cyan-600 capitalize">
                {sortOrder === "desc" ? "Plus récentes" : "Plus anciennes"}
              </span>
            </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-cyan-100 bg-white shadow-[0_12px_40px_rgba(2,48,71,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead className="bg-[#eff9fc]">
                  <tr className="border-b border-cyan-100 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    <th className="px-6 py-4">Parcelle</th>
                    <th className="px-5 py-4">Humidité du sol</th>
                    <th className="px-5 py-4">Décision</th>
                    <th className="px-5 py-4">Confiance du modèle</th>
                    <th className="px-5 py-4">Quantité recommandée</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <FileText className="mx-auto mb-3 h-9 w-9 text-cyan-200" />
                        <p className="font-bold text-slate-700">Aucune prédiction d’irrigation</p>
                        <p className="mt-1 text-sm text-slate-400">Lancez une prédiction depuis la page Recommandations pour commencer votre historique.</p>
                      </td>
                    </tr>
                  ) : filteredHistory.map((record) => {
                    const status = record.prediction?.toUpperCase();
                    const confidence = Math.round(Number(record.confidence || 0) * 100);
                    const date = new Date(record.predicted_at);
                    const decisionTone = status === "HIGH" ? "text-red-600 bg-red-50" : status === "MEDIUM" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";
                    return (
                      <tr key={`compact-${record.id}`} className="group transition hover:bg-cyan-50/30">
                        <td className="px-6 py-5">
                          <p className="font-black text-slate-900 group-hover:text-oceanBlue">{record.parcelName}</p>
                          <p className="mt-0.5 text-xs text-slate-400">{record.cropType || "Culture non renseignée"}{record.superficie ? ` · ${record.superficie} ha` : ""}</p>
                        </td>
                        <td className="px-5 py-5"><span className="font-bold text-slate-700">{record.soil_moisture}%</span></td>
                        <td className="px-5 py-5"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${decisionTone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{getPredictionBadge(status)}</span></td>
                        <td className="px-5 py-5"><div className="flex items-center gap-2"><div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${confidence}%` }} /></div><span className="text-sm font-bold text-slate-700">{confidence}%</span></div></td>
                        <td className="px-5 py-5"><span className="font-black text-cyan-700">{record.recommended_irrigation_mm != null ? `${Number(record.recommended_irrigation_mm).toFixed(1)} mm` : "—"}</span></td>
                        <td className="px-5 py-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Calendar className="h-4 w-4 text-cyan-600" /><span>{date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} · {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></div></td>
                        <td className="px-6 py-5 text-right"><button type="button" aria-label={`Voir les détails de ${record.parcelName}`} onClick={() => setSelectedRecord(record)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-oceanBlue transition hover:border-cyan-400 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"><Eye className="h-4 w-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hidden space-y-10">
            {Object.entries(groupedHistory).length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-cyan-100 bg-white px-6 py-16 text-center text-slate-400">
                <FileText className="mx-auto mb-3 h-10 w-10 text-cyan-200" />
                Aucun enregistrement ne correspond aux filtres.
              </div>
            ) : Object.entries(groupedHistory).map(([dateLabel, records]) => (
              <section key={dateLabel}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  <h2 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">{dateLabel}</h2>
                  <span className="h-px flex-1 bg-cyan-100" />
                  <span className="text-[10px] font-bold text-slate-400">{records.length} décision{records.length > 1 ? "s" : ""}</span>
                </div>

                <div className="relative ml-1 space-y-5 border-l border-cyan-200 pl-7 sm:pl-10">
                  {records.map((record) => {
                    const status = record.prediction?.toUpperCase();
                    const dotClass = status === "HIGH" ? "bg-red-500 ring-red-100" : status === "MEDIUM" ? "bg-amber-500 ring-amber-100" : "bg-emerald-500 ring-emerald-100";
                    const confidence = Math.round(Number(record.confidence || 0) * 100);
                    const date = new Date(record.predicted_at);
                    const hasWater = record.recommended_irrigation_mm != null || record.recommended_volume_m3 != null;
                    return (
                      <motion.article key={record.id} variants={itemVariants} initial="hidden" animate="show" className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(2,48,71,0.05)] transition hover:border-cyan-200 hover:shadow-[0_16px_38px_rgba(2,48,71,0.09)] sm:p-6">
                        <span className={`absolute -left-[2.05rem] top-7 h-4 w-4 rounded-full ring-4 sm:-left-[2.55rem] ${dotClass}`} />
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <h3 className="text-xl font-black tracking-tight text-slate-900">{record.parcelName}</h3>
                              <span className="text-xs font-semibold text-slate-400">{record.cropType || "Culture non renseignée"}{record.superficie ? ` · ${record.superficie} ha` : ""}</span>
                            </div>
                            <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
                              <Clock className="h-3.5 w-3.5 text-cyan-600" />
                              {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              <span className="text-slate-300">·</span>
                              Décision enregistrée
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${getPredictionColorClass(status)}`}>{getPredictionBadge(status)}</div>
                            <div className="text-right"><p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Confiance</p><p className="text-lg font-black text-slate-800">{confidence}%</p></div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-[1fr_auto]">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{getRecommendationText(status)}</p>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                              <span><b className="text-slate-700">Sol</b> {record.soil_moisture}%</span>
                              <span><b className="text-slate-700">Température</b> {record.temperature} °C</span>
                              <span><b className="text-slate-700">Pluie</b> {record.rainfall} mm</span>
                              <span><b className="text-slate-700">Vent</b> {record.wind_speed} km/h</span>
                            </div>
                          </div>
                          {hasWater && (
                            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 sm:min-w-[180px]">
                              <p className="text-[9px] font-extrabold uppercase tracking-wider text-cyan-700">Eau recommandée</p>
                              {record.recommended_irrigation_mm != null && <p className="mt-1 text-xl font-black text-slate-900">{Number(record.recommended_irrigation_mm).toFixed(1)} mm</p>}
                              {record.recommended_volume_m3 != null && <p className="text-xs font-bold text-cyan-700">≈ {Number(record.recommended_volume_m3).toFixed(1)} m³</p>}
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={() => setSelectedRecord(record)} className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-oceanBlue transition hover:text-cyan-600">Voir les détails <span aria-hidden="true">→</span></button>
                      </motion.article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Analyses", filteredHistory.length, "Historique filtré"],
              ["Confiance moyenne", filteredHistory.length ? `${Math.round(filteredHistory.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / filteredHistory.length * 100)}%` : "—", "Fiabilité des résultats"],
              ["Besoin prioritaire", filteredHistory.filter((item) => item.prediction?.toUpperCase() === "HIGH").length, "À traiter en premier"],
            ].map(([label, value, hint]) => (
              <div key={label} className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/70 p-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{hint}</p>
              </div>
            ))}
          </div>

          {/* Recommendation feed */}
          <div className="hidden grid gap-4 xl:grid-cols-2">
            {filteredHistory.length === 0 ? (
              <div className="xl:col-span-2 rounded-3xl border-2 border-dashed border-cyan-100 bg-white px-6 py-16 text-center text-slate-400">
                <FileText className="mx-auto mb-3 h-10 w-10 text-cyan-200" />
                Aucun enregistrement ne correspond aux filtres.
              </div>
            ) : filteredHistory.map((record) => {
              const status = record.prediction?.toUpperCase();
              const statusAccent = status === "HIGH" ? "bg-rose-400" : status === "MEDIUM" ? "bg-amber-400" : "bg-emerald-400";
              const date = new Date(record.predicted_at);
              const confidence = Math.round(Number(record.confidence || 0) * 100);
              return (
                <motion.article
                  key={`card-${record.id}`}
                  whileHover={{ y: -3 }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(2,48,71,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(2,48,71,0.12)]"
                >
                  <div className={`h-1.5 ${statusAccent}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                          <History className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black text-slate-900">{record.parcelName}</h3>
                          <p className="text-xs font-medium text-slate-400">{record.cropType || "Culture non renseignée"} · {date.toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-extrabold tracking-wide ${getPredictionColorClass(status)}`}>
                        {getPredictionBadge(status)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 py-3">
                      <div className="px-3"><p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Sol</p><p className="mt-1 text-lg font-black text-slate-800">{record.soil_moisture}%</p></div>
                      <div className="px-3"><p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Irrigation</p><p className="mt-1 text-lg font-black text-slate-800">{record.previous_irrigation != null ? `${record.previous_irrigation} mm` : "—"}</p></div>
                      <div className="px-3"><p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Confiance</p><p className="mt-1 text-lg font-black text-cyan-700">{confidence}%</p></div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1"><Thermometer className="h-3.5 w-3.5 text-orange-400" />{record.temperature}°C</span>
                        <span className="inline-flex items-center gap-1"><CloudRain className="h-3.5 w-3.5 text-cyan-500" />{record.rainfall} mm</span>
                        <span className="inline-flex items-center gap-1"><Wind className="h-3.5 w-3.5 text-teal-500" />{record.wind_speed} km/h</span>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-slate-400">{date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>

                    <button type="button" onClick={() => setSelectedRecord(record)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#023047] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-oceanBlue focus:outline-none focus:ring-2 focus:ring-cyan-300/50">
                      <Eye className="h-4 w-4" /> Voir l’analyse complète
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Legacy table kept for reference but replaced by the timeline feed */}
          <div className="hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-[#eff9fc] via-white to-[#f8fcfd]">
                  <tr className="border-b border-cyan-100 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                    <th className="px-6 py-4">Parcelle</th>
                    <th className="px-6 py-4">Date & Heure</th>
                    <th className="px-6 py-4 text-center">Humidité</th>
                    <th className="px-6 py-4 text-center">Irrigation Précédente</th>
                    <th className="px-6 py-4">Météo</th>
                    <th className="px-6 py-4">Décision IA</th>
                    <th className="px-6 py-4 text-right">Confiance</th>
                    <th className="px-6 py-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        Aucun enregistrement d'historique ne correspond aux
                        filtres.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((record) => {
                      const date = new Date(record.predicted_at);
                      const timeStr = date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const dateStr = date.toLocaleDateString();

                      return (
                        <tr
                          key={record.id}
                          className="group transition-colors hover:bg-cyan-50/30"
                        >
                          {/* Parcel column */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-slate-900 transition-colors group-hover:text-oceanBlue">
                                {record.parcelName}
                              </div>
                              <div className="text-xs text-slate-400">
                                {record.cropType || "Sans culture"}
                              </div>
                            </div>
                          </td>

                          {/* Date column */}
                          <td className="px-6 py-4 text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>{dateStr}</span>
                              <span className="text-slate-300">•</span>
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{timeStr}</span>
                            </div>
                          </td>

                          {/* Soil Moisture */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-xs font-bold text-cyan-700">
                              <Droplets className="h-3 w-3" />
                              {record.soil_moisture}%
                            </span>
                          </td>

                          {/* Previous Irrigation */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700">
                              <Droplets className="h-3 w-3" />
                              {record.previous_irrigation != null ? `${record.previous_irrigation} mm` : "—"}
                            </span>
                          </td>

                          {/* Weather columns compact */}
                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                              <span
                                className="flex items-center gap-0.5"
                                title="Température"
                              >
                                <Thermometer className="h-3 w-3 text-orange-400" />
                                {record.temperature}°C
                              </span>
                              <span
                                className="flex items-center gap-0.5"
                                title="Humidité de l'air"
                              >
                                <Droplets className="h-3 w-3 text-blue-400" />
                                {record.humidity}%
                              </span>
                              <span
                                className="flex items-center gap-0.5"
                                title="Pluie"
                              >
                                <CloudRain className="h-3 w-3 text-cyan-400" />
                                {record.rainfall}mm
                              </span>
                              <span
                                className="flex items-center gap-0.5"
                                title="Vent"
                              >
                                <Wind className="h-3 w-3 text-teal-400" />
                                {record.wind_speed}km/h
                              </span>
                            </div>
                          </td>

                          {/* Prediction Status Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-wide shadow-sm ${getPredictionColorClass(
                                record.prediction,
                              )}`}
                            >
                              {getPredictionBadge(record.prediction)}
                            </span>
                          </td>

                          {/* Confidence */}
                          <td className="px-6 py-4 text-right font-semibold text-slate-700">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.round(record.confidence * 100)}%` }} />
                              </div>
                              <span>{Math.round(record.confidence * 100)}%</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedRecord(record)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-oceanBlue transition hover:border-cyan-400 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Voir les détails
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#023047]/45 p-4 backdrop-blur-sm"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-cyan-100 bg-[#f8fcfd] shadow-[0_28px_80px_rgba(2,48,71,0.28)]"
            >
              <div className="flex items-start justify-between border-b border-cyan-100 bg-white p-6">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-oceanBlue">Détail de l’analyse</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900">{selectedRecord.parcelName}</h2>
                  <p className="mt-1 text-xs text-slate-500">{selectedRecord.cropType || "Culture non renseignée"} · {new Date(selectedRecord.predicted_at).toLocaleString("fr-FR")}</p>
                </div>
                <button type="button" onClick={() => setSelectedRecord(null)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-oceanBlue">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div className={`flex items-center justify-between rounded-2xl border p-4 ${getPredictionColorClass(selectedRecord.prediction)}`}>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">Décision</p>
                    <p className="mt-1 text-2xl font-black">{getPredictionBadge(selectedRecord.prediction)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">Confiance</p>
                    <p className="mt-1 text-2xl font-black">{Math.round(selectedRecord.confidence * 100)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Humidité du sol", `${selectedRecord.soil_moisture}%`, Droplets],
                    ["Irrigation précédente", selectedRecord.previous_irrigation != null ? `${selectedRecord.previous_irrigation} mm` : "—", Droplets],
                    ["Température", `${selectedRecord.temperature} °C`, Thermometer],
                    ["Pluie", `${selectedRecord.rainfall} mm`, CloudRain],
                  ].map(([label, value, Icon]) => (
                    <div key={label} className="rounded-2xl border border-cyan-100 bg-white p-3">
                      <Icon className="h-4 w-4 text-cyan-600" />
                      <p className="mt-3 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cyan-100 pt-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Météo au moment de la prédiction</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Humidité", `${selectedRecord.humidity}%`],
                      ["Pluie", `${selectedRecord.rainfall} mm`],
                      ["Vent", `${selectedRecord.wind_speed} km/h`],
                      ["Ensoleillement", `${selectedRecord.sunlight_hours} h`],
                    ].map(([label, value]) => <div key={label}><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-sm font-bold text-slate-800">{value}</p></div>)}
                  </div>
                </div>
                {(selectedRecord.recommended_irrigation_mm != null || selectedRecord.recommended_volume_m3 != null) && (
                  <div className="border-t border-cyan-100 pt-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-700">Recommandation d’eau</p>
                    <div className="mt-2 flex items-end gap-3"><p className="text-4xl font-black text-slate-900">{selectedRecord.recommended_irrigation_mm != null ? `${Number(selectedRecord.recommended_irrigation_mm).toFixed(1)} mm` : "—"}</p>{selectedRecord.recommended_volume_m3 != null && <p className="pb-1 text-sm font-bold text-cyan-700">≈ {Number(selectedRecord.recommended_volume_m3).toFixed(1)} m³</p>}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
