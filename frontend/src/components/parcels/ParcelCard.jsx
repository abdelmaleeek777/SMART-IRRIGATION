import { motion } from 'framer-motion';
import {
  Eye,
  LandPlot,
  Layers,
  MapPin,
  Pencil,
  Sprout,
  Trash2,
} from 'lucide-react';

export default function ParcelCard({
  parcel,
  exploitationName,
  isSelected,
  onSelect,
  onViewDetails,
  onEdit,
  onDelete,
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      onClick={onSelect}
      className={[
        'cursor-pointer rounded-2xl border p-5 shadow-sm transition-all duration-200',
        isSelected
          ? 'border-aquaBlue bg-gradient-to-br from-iceBlue/60 to-white shadow-[0_8px_28px_rgba(0,180,216,0.18)] ring-1 ring-aquaBlue/40 scale-[1.01]'
          : 'border-iceBlue bg-arcticWhite hover:border-aquaBlue/60 hover:shadow-[0_6px_20px_rgba(2,48,71,0.08)]',
      ].join(' ')}
    >
      {/* Top row: name + surface */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isSelected && (
              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-aquaBlue" />
            )}
            <h3 className="truncate text-base font-bold text-midnight">
              {parcel.nom}
            </h3>
          </div>
          {exploitationName && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-midnight/55">
              <MapPin className="h-3 w-3 text-aquaBlue" />
              <span className="truncate">{exploitationName}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 rounded-xl bg-iceBlue/70 px-3 py-1.5 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-oceanBlue">Surface</p>
          <p className="mt-0.5 text-lg font-bold text-midnight">
            {Number(parcel.superficie).toFixed(2)} ha
          </p>
        </div>
      </div>

      {/* Meta grid */}
      <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-white/70 px-3 py-3 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-midnight/50">
            <Sprout className="h-3 w-3 text-aquaBlue" />
            <span>Culture</span>
          </div>
          <p className="truncate text-xs font-semibold text-midnight">
            {parcel.type_culture || '—'}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-midnight/50">
            <Layers className="h-3 w-3 text-aquaBlue" />
            <span>Sol</span>
          </div>
          <p className="truncate text-xs font-semibold text-midnight">
            {parcel.type_sol || '—'}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-midnight/50">
            <LandPlot className="h-3 w-3 text-aquaBlue" />
            <span>Superficie</span>
          </div>
          <p className="truncate text-xs font-semibold text-midnight">
            {Number(parcel.superficie).toFixed(2)} ha
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          id={`parcel-details-${parcel.id_parcelle}`}
          onClick={() => onViewDetails(parcel)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-oceanBlue px-3 py-2 text-xs font-semibold text-white shadow-[0_6px_16px_rgba(0,119,182,0.20)] transition hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(0,119,182,0.28)]"
        >
          <Eye className="h-3.5 w-3.5" />
          Détails
        </button>

        <button
          type="button"
          id={`parcel-edit-${parcel.id_parcelle}`}
          onClick={() => onEdit(parcel)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-iceBlue bg-white px-3 py-2 text-xs font-semibold text-midnight transition hover:border-aquaBlue hover:text-oceanBlue"
        >
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </button>

        <button
          type="button"
          id={`parcel-delete-${parcel.id_parcelle}`}
          onClick={() => onDelete(parcel)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Supprimer
        </button>
      </div>
    </motion.article>
  );
}
