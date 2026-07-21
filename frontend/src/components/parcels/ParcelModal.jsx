import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MapPin, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ParcelMap = lazy(() => import('../ParcelMap'));

const soilOptions = ['Argileux', 'Limon', 'Sableux', 'Silteux', 'Limon-Argileux', 'Sableux-Limon'];
const cropOptions = ['Tomate', 'Blé', 'Olivier', 'Agrumes', 'Pastèque', 'Maïs', 'Pomme de terre', 'Autre'];

const initialForm = {
  id_exploitation: '',
  nom: '',
  superficie: '',
  type_culture: 'Tomate',
  type_sol: 'Argileux',
  latitude: '30.4278',
  longitude: '-9.5981',
  polygon: null,
};

export default function ParcelModal({
  isOpen,
  mode = 'add',
  initialData,
  exploitations = [],
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id_exploitation: initialData.id_exploitation
            ? String(initialData.id_exploitation)
            : exploitations[0]?.id_exploitation
            ? String(exploitations[0].id_exploitation)
            : '',
          nom: initialData.nom || '',
          superficie: initialData.superficie !== undefined ? String(initialData.superficie) : '',
          type_culture: initialData.type_culture || 'Tomate',
          type_sol: initialData.type_sol || 'Argileux',
          latitude: initialData.latitude !== undefined ? String(initialData.latitude) : '30.4278',
          longitude: initialData.longitude !== undefined ? String(initialData.longitude) : '-9.5981',
          polygon: initialData.polygon || null,
        });
      } else {
        setFormData({
          ...initialForm,
          id_exploitation: exploitations[0]?.id_exploitation
            ? String(exploitations[0].id_exploitation)
            : '',
        });
      }
    }
  }, [isOpen, initialData, exploitations]);

  const title = mode === 'edit' ? 'Modifier la parcelle' : 'Ajouter une parcelle';
  const submitLabel = mode === 'edit' ? 'Enregistrer les modifications' : 'Ajouter la parcelle';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleMapChange = (mapData) => {
    if (!mapData) return;
    setFormData((current) => ({
      ...current,
      polygon: mapData.polygon,
      superficie: mapData.superficie,
      latitude: mapData.latitude,
      longitude: mapData.longitude,
    }));
  };

  const handleMapClear = () => {
    setFormData((current) => ({
      ...current,
      polygon: null,
      superficie: '',
      latitude: '',
      longitude: '',
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const lat = Number(formData.latitude || 30.4278);
    const lng = Number(formData.longitude || -9.5981);
    const delta = 0.002;
    const defaultPolygon = [
      [lat - delta, lng - delta],
      [lat + delta, lng - delta],
      [lat + delta, lng + delta],
      [lat - delta, lng + delta],
      [lat - delta, lng - delta],
    ];

    onSubmit({
      id_exploitation: Number(formData.id_exploitation),
      nom: formData.nom.trim(),
      superficie: Number(formData.superficie),
      type_culture: formData.type_culture,
      type_sol: formData.type_sol,
      latitude: lat,
      longitude: lng,
      polygon: formData.polygon || defaultPolygon,
    });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Fermer le modal"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#023047]/40 backdrop-blur-[3px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative z-10 my-auto w-full max-w-5xl rounded-[2rem] border border-iceBlue bg-arcticWhite p-6 shadow-[0_24px_70px_rgba(2,48,71,0.22)] max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-iceBlue pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oceanBlue">
                  Gestion des parcelles
                </p>
                <h3 className="mt-1 text-2xl font-bold text-midnight">{title}</h3>
                <p className="mt-1 text-xs text-midnight/60">
                  Dessinez les contours de la parcelle sur la carte pour calculer automatiquement sa superficie.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-iceBlue bg-white text-midnight transition hover:text-oceanBlue"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: 2-column Grid */}
            <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col overflow-y-auto space-y-4">
              <div className="grid gap-6 lg:grid-cols-12 flex-1 min-h-0">
                {/* Left: Map for drawing parcel boundary */}
                <div className="lg:col-span-7 flex flex-col min-h-[340px]">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-oceanBlue flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-aquaBlue" />
                      Tracez la superficie sur la carte
                    </label>
                    <span className="text-xs text-midnight/50">Utilisez l'outil polygone en haut à droite de la carte</span>
                  </div>

                  <div className="flex-1 rounded-2xl border border-iceBlue overflow-hidden shadow-inner min-h-[320px]">
                    <Suspense
                      fallback={
                        <div className="flex h-full min-h-[320px] items-center justify-center bg-arcticWhite">
                          <Loader2 className="h-6 w-6 animate-spin text-aquaBlue" />
                        </div>
                      }
                    >
                      <ParcelMap
                        value={{
                          polygon: formData.polygon,
                          superficie: formData.superficie,
                          latitude: formData.latitude,
                          longitude: formData.longitude,
                        }}
                        onChange={handleMapChange}
                        onClear={handleMapClear}
                      />
                    </Suspense>
                  </div>
                </div>

                {/* Right: Form Details */}
                <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Exploitation selection */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-midnight">
                        Exploitation agricole
                      </label>
                      <select
                        name="id_exploitation"
                        value={formData.id_exploitation}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-iceBlue bg-white px-3.5 py-2.5 text-sm text-midnight outline-none transition focus:border-aquaBlue"
                      >
                        <option value="" disabled>Sélectionnez une exploitation</option>
                        {exploitations.map((ex) => (
                          <option key={ex.id_exploitation} value={String(ex.id_exploitation)}>
                            {ex.nom} ({ex.localisation})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Parcel Name */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-midnight">
                        Nom de la parcelle
                      </label>
                      <input
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-iceBlue bg-white px-3.5 py-2.5 text-sm text-midnight outline-none transition placeholder:text-midnight/35 focus:border-aquaBlue"
                        placeholder="Ex: Parcelle Sud 1"
                      />
                    </div>

                    {/* Surface & Crop */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          Superficie (ha)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="superficie"
                          value={formData.superficie}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-iceBlue bg-white px-3.5 py-2.5 text-sm font-bold text-oceanBlue outline-none transition placeholder:text-midnight/35 focus:border-aquaBlue"
                          placeholder="Calculée..."
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          Culture
                        </label>
                        <select
                          name="type_culture"
                          value={formData.type_culture}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-iceBlue bg-white px-3.5 py-2.5 text-sm text-midnight outline-none transition focus:border-aquaBlue"
                        >
                          {cropOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Soil type & Latitude/Longitude */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          Type de sol
                        </label>
                        <select
                          name="type_sol"
                          value={formData.type_sol}
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-iceBlue bg-white px-3.5 py-2.5 text-sm text-midnight outline-none transition focus:border-aquaBlue"
                        >
                          {soilOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-midnight/60">
                            Lat
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-iceBlue bg-white px-2.5 py-2.5 text-xs text-midnight outline-none transition focus:border-aquaBlue"
                            placeholder="30.4278"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-midnight/60">
                            Lng
                          </label>
                          <input
                            type="number"
                            step="0.000001"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-iceBlue bg-white px-2.5 py-2.5 text-xs text-midnight outline-none transition focus:border-aquaBlue"
                            placeholder="-9.5981"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse gap-3 pt-4 border-t border-iceBlue sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-iceBlue bg-white px-5 py-2.5 text-sm font-semibold text-midnight transition hover:border-aquaBlue"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-oceanBlue px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,119,182,0.22)] transition hover:scale-[1.01]"
                    >
                      {submitLabel}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
