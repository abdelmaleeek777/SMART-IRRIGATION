import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Droplets, Layers, Loader2, MapPin, Sprout, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { FilterDropdown } from './ParcelFilters';

const ParcelMap = lazy(() => import('../ParcelMap'));

const soilOptions = ['Loamy', 'Clay', 'Sandy', 'Silt'];
const cropOptions = ['Sugarcane', 'Wheat', 'Rice', 'Potato', 'Cotton', 'Maize'];
const irrigationOptions = ['Drip', 'Rainfed', 'Sprinkler', 'Canal'];
const growthStageOptions = ['Sowing', 'Vegetative', 'Flowering', 'Harvest'];

const initialForm = {
  id_exploitation: '',
  nom: '',
  superficie: '',
  type_culture: 'Tomate',
  type_sol: 'Argileux',
  organic_carbon: '',
  soil_ph: '',
  irrigation_type: 'Drip',
  crop_growth_stage: 'Sowing',
  mulching_used: 'No',
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
  const [formErrors, setFormErrors] = useState({});

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
          organic_carbon: initialData.organic_carbon !== undefined ? String(initialData.organic_carbon) : '',
          soil_ph: initialData.soil_ph !== undefined ? String(initialData.soil_ph) : '',
          irrigation_type: initialData.irrigation_type || 'Drip',
          crop_growth_stage: initialData.crop_growth_stage || 'Sowing',
          mulching_used: initialData.mulching_used || 'No',
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
        setFormErrors({});
      }
    }
  }, [isOpen, initialData, exploitations]);

  const title = mode === 'edit' ? 'Modifier la parcelle' : 'Ajouter une parcelle';
  const submitLabel = mode === 'edit' ? 'Enregistrer les modifications' : 'Ajouter la parcelle';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: undefined }));
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

    const nextErrors = {};
    const surfaceValue = Number(formData.superficie);
    const organicCarbonValue = formData.organic_carbon === '' ? null : Number(formData.organic_carbon);
    const soilPhValue = formData.soil_ph === '' ? null : Number(formData.soil_ph);

    if (!formData.nom.trim()) nextErrors.nom = 'Le nom est requis.';
    if (!formData.superficie || Number.isNaN(surfaceValue) || surfaceValue <= 0) {
      nextErrors.superficie = 'La superficie doit être supérieure à 0.';
    }
    if (formData.organic_carbon !== '' && (Number.isNaN(organicCarbonValue) || organicCarbonValue < 0)) {
      nextErrors.organic_carbon = 'La valeur doit être numérique et positive.';
    }
    if (formData.soil_ph !== '' && (Number.isNaN(soilPhValue) || soilPhValue < 0 || soilPhValue > 14)) {
      nextErrors.soil_ph = 'Le pH doit être compris entre 0 et 14.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

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
      organic_carbon: organicCarbonValue,
      soil_ph: soilPhValue,
      irrigation_type: formData.irrigation_type,
      crop_growth_stage: formData.crop_growth_stage,
      mulching_used: formData.mulching_used,
      latitude: lat,
      longitude: lng,
      polygon: formData.polygon || defaultPolygon,
    });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 sm:p-5">
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
            className="relative z-10 flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-iceBlue bg-arcticWhite p-5 shadow-[0_24px_70px_rgba(2,48,71,0.22)] sm:max-h-[calc(100vh-2.5rem)] sm:p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-iceBlue pb-4">
              <div>
                <h3 className="mt-1 text-2xl font-bold text-midnight">{title}</h3>
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
            <form onSubmit={handleSubmit} className="mt-4 flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="grid items-start gap-5 lg:grid-cols-12">
                {/* Left: Map for drawing parcel boundary */}
                <div className="flex flex-col lg:col-span-7">
                  <div className="mb-2 flex items-center justify-between [&>span]:hidden">
                    <label className="text-xs font-bold uppercase tracking-wider text-oceanBlue flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-aquaBlue" />
                      Tracez la superficie sur la carte
                    </label>
                    <span className="text-xs text-midnight/50">Utilisez l'outil polygone en haut à droite de la carte</span>
                  </div>

                  <div className="h-[420px] overflow-hidden rounded-2xl border border-iceBlue shadow-inner sm:h-[480px]">
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
                      <FilterDropdown
                        id="form-exploitation"
                        value={formData.id_exploitation}
                        onChange={(value) => handleChange({ target: { name: 'id_exploitation', value } })}
                        ariaLabel="Exploitation agricole"
                        icon={MapPin}
                        options={[
                          { value: '', label: 'Sélectionnez une exploitation' },
                          ...exploitations.map((ex) => ({ value: String(ex.id_exploitation), label: `${ex.nom} (${ex.localisation})` })),
                        ]}
                      />
                      <select
                        name="id_exploitation"
                        value={formData.id_exploitation}
                        onChange={handleChange}
                        required
                        className="hidden"
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
                        <FilterDropdown
                          id="form-crop"
                          value={formData.type_culture}
                          onChange={(value) => handleChange({ target: { name: 'type_culture', value } })}
                          ariaLabel="Culture"
                          options={cropOptions.map((crop) => ({ value: crop, label: crop }))}
                          icon={Sprout}
                        />
                      </div>
                    </div>

                    {/* Soil type & Latitude/Longitude */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          Type de sol
                        </label>
                        <FilterDropdown
                          id="form-soil"
                          value={formData.type_sol}
                          onChange={(value) => handleChange({ target: { name: 'type_sol', value } })}
                          ariaLabel="Type de sol"
                          options={soilOptions.map((soil) => ({ value: soil, label: soil }))}
                          icon={Layers}
                        />
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

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          Carbone organique
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="organic_carbon"
                          value={formData.organic_carbon}
                          onChange={handleChange}
                          className="w-full cursor-pointer appearance-none rounded-xl border border-iceBlue bg-white px-3.5 py-2.5 text-sm font-medium text-midnight shadow-sm outline-none transition hover:border-aquaBlue/60 focus:border-aquaBlue focus:ring-2 focus:ring-aquaBlue/20"
                          placeholder="0.00"
                        />
                        {formErrors.organic_carbon ? (
                          <p className="mt-1 text-xs text-red-600">{formErrors.organic_carbon}</p>
                        ) : null}
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          pH du sol
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          name="soil_ph"
                          value={formData.soil_ph}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-iceBlue bg-white px-3.5 py-2.5 text-sm text-midnight outline-none transition focus:border-aquaBlue"
                          placeholder="6.5"
                        />
                        {formErrors.soil_ph ? (
                          <p className="mt-1 text-xs text-red-600">{formErrors.soil_ph}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          Type d'irrigation
                        </label>
                        <FilterDropdown
                          id="form-irrigation"
                          value={formData.irrigation_type}
                          onChange={(value) => handleChange({ target: { name: 'irrigation_type', value } })}
                          ariaLabel="Type d'irrigation"
                          options={irrigationOptions.map((option) => ({ value: option, label: option }))}
                          icon={Droplets}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-midnight">
                          Stade de croissance
                        </label>
                        <FilterDropdown
                          id="form-growth-stage"
                          value={formData.crop_growth_stage}
                          onChange={(value) => handleChange({ target: { name: 'crop_growth_stage', value } })}
                          ariaLabel="Stade de croissance"
                          options={growthStageOptions.map((option) => ({ value: option, label: option }))}
                          icon={Sprout}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="mulching_used"
                        name="mulching_used"
                        checked={formData.mulching_used === 'Yes'}
                        onChange={(e) => {
                          setFormData((current) => ({
                            ...current,
                            mulching_used: e.target.checked ? 'Yes' : 'No',
                          }));
                        }}
                        className="h-4 w-4 rounded border-iceBlue text-oceanBlue focus:ring-aquaBlue"
                      />
                      <label htmlFor="mulching_used" className="text-xs font-semibold text-midnight cursor-pointer select-none">
                        Paillage utilisé (Mulching)
                      </label>
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
