import { Layers, MapPin, Search, Sprout } from 'lucide-react';

export default function ParcelFilters({
  exploitations,
  cropTypes,
  soilTypes,
  filters,
  onChange,
}) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const selectBase =
    'w-full rounded-xl border border-iceBlue bg-white px-3 py-2.5 text-sm text-midnight shadow-sm outline-none transition focus:border-aquaBlue focus:ring-2 focus:ring-aquaBlue/20 appearance-none cursor-pointer';

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* Exploitation filter */}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aquaBlue" />
        <select
          id="filter-exploitation"
          value={filters.exploitationId}
          onChange={(e) => handleChange('exploitationId', e.target.value)}
          className={`${selectBase} pl-9`}
        >
          <option value="">Toutes les exploitations</option>
          {exploitations.map((ex) => (
            <option key={ex.id_exploitation} value={String(ex.id_exploitation)}>
              {ex.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Crop type filter */}
      <div className="relative">
        <Sprout className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aquaBlue" />
        <select
          id="filter-crop"
          value={filters.cropType}
          onChange={(e) => handleChange('cropType', e.target.value)}
          className={`${selectBase} pl-9`}
        >
          <option value="">Toutes les cultures</option>
          {cropTypes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Soil type filter */}
      <div className="relative">
        <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aquaBlue" />
        <select
          id="filter-soil"
          value={filters.soilType}
          onChange={(e) => handleChange('soilType', e.target.value)}
          className={`${selectBase} pl-9`}
        >
          <option value="">Tous les types de sol</option>
          {soilTypes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aquaBlue" />
        <input
          id="filter-search"
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Rechercher une parcelle..."
          className={`${selectBase} pl-9`}
        />
      </div>
    </div>
  );
}
