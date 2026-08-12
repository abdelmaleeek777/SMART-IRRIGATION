import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Layers, MapPin, Search, Sprout } from 'lucide-react';

export function FilterDropdown({ id, value, options, onChange, icon: Icon, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-aquaBlue" />
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 pl-9 text-left text-sm text-midnight shadow-sm outline-none transition hover:border-aquaBlue/60 focus:ring-2 focus:ring-aquaBlue/20 ${isOpen ? 'border-aquaBlue ring-2 ring-aquaBlue/20' : 'border-iceBlue'}`}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-aquaBlue' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-cyan-200 bg-white p-1.5 shadow-[0_14px_30px_rgba(2,48,71,0.14)]"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${value === option.value ? 'bg-cyan-50 font-semibold text-oceanBlue' : 'text-slate-700 hover:bg-slate-50 hover:text-oceanBlue'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* Exploitation filter */}
      <FilterDropdown
        id="filter-exploitation"
        ariaLabel="Filtrer par exploitation"
        value={filters.exploitationId}
        onChange={(value) => handleChange('exploitationId', value)}
        icon={MapPin}
        options={[
          { value: '', label: 'Toutes les exploitations' },
          ...exploitations.map((ex) => ({ value: String(ex.id_exploitation), label: ex.nom })),
        ]}
      />

      {/* Crop type filter */}
      <FilterDropdown
        id="filter-crop"
        ariaLabel="Filtrer par culture"
        value={filters.cropType}
        onChange={(value) => handleChange('cropType', value)}
        icon={Sprout}
        options={[
          { value: '', label: 'Toutes les cultures' },
          ...cropTypes.map((crop) => ({ value: crop, label: crop })),
        ]}
      />

      {/* Soil type filter */}
      <FilterDropdown
        id="filter-soil"
        ariaLabel="Filtrer par type de sol"
        value={filters.soilType}
        onChange={(value) => handleChange('soilType', value)}
        icon={Layers}
        options={[
          { value: '', label: 'Tous les types de sol' },
          ...soilTypes.map((soil) => ({ value: soil, label: soil })),
        ]}
      />

      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aquaBlue" />
        <input
          id="filter-search"
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Rechercher une parcelle..."
          className="w-full rounded-xl border border-iceBlue bg-white px-3 py-2.5 pl-9 text-sm text-midnight shadow-sm outline-none transition focus:border-aquaBlue focus:ring-2 focus:ring-aquaBlue/20"
        />
      </div>
    </div>
  );
}
