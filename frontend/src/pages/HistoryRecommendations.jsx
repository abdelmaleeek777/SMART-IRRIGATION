import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Loader2,
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
} from "lucide-react";
import { apiRequest } from "../services/api";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParcelFilter, setSelectedParcelFilter] = useState("all");
  const [selectedPredictionFilter, setSelectedPredictionFilter] =
    useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc' for predicted_at

  useEffect(() => {
    fetchData();
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
    return pred.toUpperCase();
  };

  // Filter & Sort Logic
  const filteredHistory = allHistory
    .filter((item) => {
      // 1. Search Query (Matches parcel name or crop type)
      const matchesSearch =
        item.parcelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.cropType &&
          item.cropType.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Parcel Filter
      const matchesParcel =
        selectedParcelFilter === "all" ||
        String(item.id_parcelle) === selectedParcelFilter;

      // 3. Prediction Filter
      const matchesPrediction =
        selectedPredictionFilter === "all" ||
        item.prediction.toUpperCase() ===
          selectedPredictionFilter.toUpperCase();

      return matchesSearch && matchesParcel && matchesPrediction;
    })
    .sort((a, b) => {
      const dateA = new Date(a.predicted_at).getTime();
      const dateB = new Date(b.predicted_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
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
          <div className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-soft md:grid-cols-4 items-center">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Rechercher parcelle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Parcel Select Filter */}
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Filter className="h-4 w-4" />
              </span>
              <select
                value={selectedParcelFilter}
                onChange={(e) => setSelectedParcelFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 appearance-none bg-white"
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
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Droplets className="h-4 w-4" />
              </span>
              <select
                value={selectedPredictionFilter}
                onChange={(e) => setSelectedPredictionFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 appearance-none bg-white"
              >
                <option value="all">Toutes les décisions</option>
                <option value="high">HIGH (Irrigation nécessaire)</option>
                <option value="medium">MEDIUM (Surveillance)</option>
                <option value="low">LOW (Aucune irrigation)</option>
              </select>
            </div>

            {/* Sort Toggle Button */}
            <button
              onClick={toggleSortOrder}
              className="flex items-center justify-between w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 bg-white hover:bg-slate-50 transition"
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

          {/* Table Container */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Parcelle</th>
                    <th className="px-6 py-4">Date & Heure</th>
                    <th className="px-6 py-4 text-center">Humidité</th>
                    <th className="px-6 py-4 text-center">Irrigation Précédente</th>
                    <th className="px-6 py-4">Météo</th>
                    <th className="px-6 py-4">Décision IA</th>
                    <th className="px-6 py-4 text-right">Confiance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
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
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          {/* Parcel column */}
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-slate-900">
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
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getPredictionColorClass(
                                record.prediction,
                              )}`}
                            >
                              {getPredictionBadge(record.prediction)}
                            </span>
                          </td>

                          {/* Confidence */}
                          <td className="px-6 py-4 text-right font-semibold text-slate-700">
                            {Math.round(record.confidence * 100)}%
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
    </section>
  );
}
