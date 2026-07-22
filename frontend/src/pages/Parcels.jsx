import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LandPlot,
  Loader2,
  MapPinned,
  Plus,
  Sprout,
  WifiOff,
} from "lucide-react";
import { apiRequest } from "../services/api";
import ParcelCard from "../components/parcels/ParcelCard";
import ParcelFilters from "../components/parcels/ParcelFilters";
import ParcelDetailsPanel from "../components/parcels/ParcelDetailsPanel";
import ParcelDeleteModal from "../components/parcels/ParcelDeleteModal";
import ParcelModal from "../components/parcels/ParcelModal";

// Lazy-load the map to avoid SSR issues with Leaflet
const ParcelsMap = lazy(() => import("../components/parcels/ParcelsMap"));

/* ─── Animation variants ──────────────────────────────────────────── */
const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

/* ─── Map loading skeleton ──────────────────────────────────────────── */
function MapSkeleton() {
  return (
    <div className="flex h-full min-h-[460px] items-center justify-center rounded-3xl border border-iceBlue bg-arcticWhite shadow-[0_18px_60px_rgba(2,48,71,0.08)]">
      <div className="flex flex-col items-center gap-3 text-midnight/40">
        <Loader2 className="h-8 w-8 animate-spin text-aquaBlue" />
        <p className="text-sm font-medium">Chargement de la carte…</p>
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function EmptyState({ filtered, onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-aquaBlue/40 bg-iceBlue/20 px-8 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-iceBlue text-oceanBlue">
        <MapPinned className="h-8 w-8" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oceanBlue">
          {filtered ? "Aucun résultat" : "Aucune parcelle"}
        </p>
        <h3 className="mt-2 text-xl font-bold text-midnight">
          {filtered
            ? "Aucune parcelle ne correspond aux filtres."
            : "Vous n'avez pas encore ajouté de parcelle."}
        </h3>
        {!filtered && (
          <p className="mt-2 text-sm text-midnight/55">
            Commencez par créer votre première parcelle agricole.
          </p>
        )}
      </div>
      {!filtered && (
        <button
          type="button"
          id="empty-state-add-parcel"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-oceanBlue px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,119,182,0.22)] transition hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Ajouter une parcelle
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function Parcels() {
  const [searchParams] = useSearchParams();

  /* ── Data state ── */
  const [parcels, setParcels] = useState([]);
  const [exploitations, setExploitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── UI state ── */
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [detailsPanel, setDetailsPanel] = useState({
    isOpen: false,
    parcel: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    parcel: null,
  });
  const [parcelModal, setParcelModal] = useState({
    isOpen: false,
    mode: "add",
    parcel: null,
  });

  /* ── Filters ── */
  const initialExploitationId = searchParams.get("exploitationId") ?? "";
  const [filters, setFilters] = useState({
    exploitationId: initialExploitationId,
    cropType: "",
    soilType: "",
    search: "",
  });

  /* ── Fetch data ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [parcelData, exploitationData] = await Promise.all([
          apiRequest("/parcelles/"),
          apiRequest("/exploitations/"),
        ]);
        setParcels(parcelData);
        setExploitations(exploitationData);
      } catch (err) {
        setError(err.message || "Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Derived: exploitation map for quick lookup ── */
  const exploitationMap = useMemo(() => {
    const map = {};
    exploitations.forEach((ex) => {
      map[ex.id_exploitation] = ex;
    });
    return map;
  }, [exploitations]);

  /* ── Derived: unique crop & soil types from actual data ── */
  const cropTypes = useMemo(
    () =>
      [...new Set(parcels.map((p) => p.type_culture).filter(Boolean))].sort(),
    [parcels],
  );
  const soilTypes = useMemo(
    () => [...new Set(parcels.map((p) => p.type_sol).filter(Boolean))].sort(),
    [parcels],
  );

  /* ── Filtered parcels ── */
  const filteredParcels = useMemo(() => {
    return parcels.filter((parcel) => {
      if (
        filters.exploitationId &&
        String(parcel.id_exploitation) !== String(filters.exploitationId)
      )
        return false;
      if (filters.cropType && parcel.type_culture !== filters.cropType)
        return false;
      if (filters.soilType && parcel.type_sol !== filters.soilType)
        return false;
      if (
        filters.search &&
        !parcel.nom?.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [parcels, filters]);

  /* ── Handlers ── */
  const openAddModal = () => {
    setParcelModal({ isOpen: true, mode: "add", parcel: null });
  };

  const openEditModal = (parcel) => {
    setParcelModal({ isOpen: true, mode: "edit", parcel });
  };

  const closeParcelModal = () => {
    setParcelModal({ isOpen: false, mode: "add", parcel: null });
  };

  const handleSaveParcel = async (formData) => {
    try {
      if (parcelModal.mode === "edit" && parcelModal.parcel?.id_parcelle) {
        const updated = await apiRequest(
          `/parcelles/${parcelModal.parcel.id_parcelle}`,
          {
            method: "PUT",
            body: JSON.stringify(formData),
          },
        );
        setParcels((current) =>
          current.map((p) =>
            p.id_parcelle === parcelModal.parcel.id_parcelle
              ? { ...p, ...updated }
              : p,
          ),
        );
      } else {
        const created = await apiRequest("/parcelles/", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        setParcels((current) => [...current, created]);
      }
      closeParcelModal();
    } catch (err) {
      console.error("Error saving parcel:", err);
    }
  };

  const handleParcelSelect = (parcelId) => {
    setSelectedParcelId((prev) => (prev === parcelId ? null : parcelId));
  };

  const handleViewDetails = (parcel) => {
    setDetailsPanel({ isOpen: true, parcel });
  };

  const openDeleteModal = (parcel) => {
    setDeleteModal({ isOpen: true, parcel });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, parcel: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.parcel) return;
    const idToDelete = deleteModal.parcel.id_parcelle;
    try {
      await apiRequest(`/parcelles/${idToDelete}`, { method: "DELETE" });
      setParcels((current) =>
        current.filter((p) => p.id_parcelle !== idToDelete),
      );
      if (selectedParcelId === idToDelete) setSelectedParcelId(null);
    } catch (err) {
      console.error("Error deleting parcel:", err);
    } finally {
      closeDeleteModal();
    }
  };

  /* ── Stats ── */
  const totalSurface = useMemo(
    () => parcels.reduce((sum, p) => sum + Number(p.superficie || 0), 0),
    [parcels],
  );

  /* ═══════════════════════════════════════════════════════════════ */
  /* RENDER                                                          */
  /* ═══════════════════════════════════════════════════════════════ */

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ── Header ── */}
      <motion.section
        variants={itemVariants}
        className="flex flex-col gap-4 rounded-3xl border border-iceBlue bg-arcticWhite p-6 shadow-[0_18px_60px_rgba(2,48,71,0.08)] lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oceanBlue">
            Gestion des parcelles
          </p>
          <h1 className="mt-2 text-3xl font-bold text-midnight">
            Vos parcelles agricoles
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-midnight/65">
            Visualisez et gérez l'ensemble de vos parcelles agricoles.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          id="add-parcel-header"
          onClick={openAddModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-oceanBlue px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,119,182,0.22)] transition"
        >
          <Plus className="h-4 w-4" />
          Ajouter une parcelle
        </motion.button>
      </motion.section>

      {/* ── Stats mini-cards ── */}
      <motion.section
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-3"
      >
        {[
          {
            label: "Exploitations",
            value: exploitations.length,
            icon: Sprout,
          },
          {
            label: "Parcelles",
            value: parcels.length,
            icon: MapPinned,
          },
          {
            label: "Surface totale",
            value: `${totalSurface.toFixed(1)} ha`,
            icon: LandPlot,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-3xl border border-iceBlue bg-arcticWhite/95 p-5 shadow-[0_16px_40px_rgba(2,48,71,0.07)] backdrop-blur"
            >
              <div className="relative z-10 space-y-2">
                <p className="text-sm font-medium text-midnight/60">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-midnight leading-none">
                  {card.value}
                </p>
              </div>

              <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-40">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#e0f2fe] to-[#e0f2fe]/20 rotate-[-14deg]">
                  <Icon className="h-12 w-12 text-oceanBlue" />
                </div>
              </div>
            </div>
          );
        })}
      </motion.section>

      {/* ── Filters ── */}
      <motion.section
        variants={itemVariants}
        className="rounded-3xl border border-iceBlue bg-arcticWhite p-5 shadow-[0_18px_60px_rgba(2,48,71,0.06)]"
      >
        <ParcelFilters
          exploitations={exploitations}
          cropTypes={cropTypes}
          soilTypes={soilTypes}
          filters={filters}
          onChange={setFilters}
        />
      </motion.section>

      {/* ── Loading state ── */}
      {loading && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 rounded-3xl border border-iceBlue bg-arcticWhite py-20 text-midnight/50 shadow-[0_18px_60px_rgba(2,48,71,0.06)]"
        >
          <Loader2 className="h-6 w-6 animate-spin text-aquaBlue" />
          <p className="text-sm font-medium">Chargement des parcelles…</p>
        </motion.div>
      )}

      {/* ── Error state ── */}
      {!loading && error && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4 rounded-3xl border border-red-200 bg-red-50 px-6 py-14 text-center shadow-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <WifiOff className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-600">
              Erreur de chargement
            </p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        </motion.div>
      )}

      {/* ── Main two-column layout ── */}
      {!loading && !error && (
        <motion.section
          variants={itemVariants}
          className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start"
        >
          {/* LEFT — Satellite map (sticky while page scrolls) */}
          <div className="sticky top-6 h-[600px] w-full">
            <Suspense fallback={<MapSkeleton />}>
              <ParcelsMap
                parcels={filteredParcels}
                selectedParcelId={selectedParcelId}
                onParcelClick={handleParcelSelect}
              />
            </Suspense>
          </div>

          {/* RIGHT — Parcel list (natural height, scrolls with page) */}
          <div className="flex h-[600px] flex-col overflow-hidden rounded-3xl border border-iceBlue bg-arcticWhite shadow-[0_18px_60px_rgba(2,48,71,0.08)]">
            {" "}
            {/* List header */}
            <div className="flex shrink-0 items-center justify-between border-b border-iceBlue px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oceanBlue">
                  Parcelles
                </p>
                <p className="mt-0.5 text-lg font-bold text-midnight">
                  ({filteredParcels.length})
                </p>
              </div>
              {filteredParcels.length !== parcels.length && (
                <span className="rounded-full border border-aquaBlue/40 bg-iceBlue/60 px-3 py-1 text-xs font-semibold text-oceanBlue">
                  Filtré · {filteredParcels.length}/{parcels.length}
                </span>
              )}
            </div>
            {/* Card list — grows naturally */}
            {/* Only parcel cards scroll */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {filteredParcels.length === 0 ? (
                <EmptyState
                  filtered={parcels.length > 0}
                  onAdd={openAddModal}
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredParcels.map((parcel) => (
                      <ParcelCard
                        key={parcel.id_parcelle}
                        parcel={parcel}
                        exploitationName={
                          exploitationMap[parcel.id_exploitation]?.nom ?? null
                        }
                        isSelected={parcel.id_parcelle === selectedParcelId}
                        onSelect={() => handleParcelSelect(parcel.id_parcelle)}
                        onViewDetails={handleViewDetails}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Add / Edit Parcel Modal ── */}
      <ParcelModal
        isOpen={parcelModal.isOpen}
        mode={parcelModal.mode}
        initialData={parcelModal.parcel}
        exploitations={exploitations}
        onClose={closeParcelModal}
        onSubmit={handleSaveParcel}
      />

      {/* ── Details slide-over panel ── */}
      <ParcelDetailsPanel
        parcel={detailsPanel.parcel}
        exploitationName={
          detailsPanel.parcel
            ? exploitationMap[detailsPanel.parcel.id_exploitation]?.nom
            : null
        }
        isOpen={detailsPanel.isOpen}
        onClose={() => setDetailsPanel({ isOpen: false, parcel: null })}
      />

      {/* ── Delete confirmation modal ── */}
      <ParcelDeleteModal
        isOpen={deleteModal.isOpen}
        parcelName={deleteModal.parcel?.nom}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}
