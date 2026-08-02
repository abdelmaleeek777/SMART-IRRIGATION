import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Droplets,
  LandPlot,
  Layers,
  MapPin,
  Navigation,
  Sprout,
  X,
} from "lucide-react";
import ParcelViewMap from "./ParcelViewMap";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-iceBlue bg-white/70 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-midnight/60">
        <Icon className="h-4 w-4 text-aquaBlue" />
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold text-midnight">
        {value || "—"}
      </span>
    </div>
  );
}

export default function ParcelDetailsPanel({
  parcel,
  exploitationName,
  isOpen,
  onClose,
}) {
  return createPortal(
    <AnimatePresence>
      {isOpen && parcel ? (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Fermer le panneau"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-[#023047]/30 backdrop-blur-[2px]"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: 0, opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-48 top-14 z-[9999] rounded-3xl flex h-[85vh] w-full max-w-5xl flex-col overflow-y-auto border-l border-iceBlue bg-arcticWhite shadow-[0_0_80px_rgba(2,48,71,0.18)]"
          >
            {/* Panel header */}
            <div className="flex items-start justify-between gap-4 border-b border-iceBlue bg-white/80 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oceanBlue">
                  Détails de la parcelle
                </p>
                <h2 className="mt-1.5 text-2xl font-bold text-midnight">
                  {parcel.nom}
                </h2>
                {exploitationName && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-midnight/55">
                    <MapPin className="h-4 w-4 text-aquaBlue" />
                    <span>{exploitationName}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                id="close-parcel-details"
                onClick={onClose}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-iceBlue bg-white text-midnight/50 transition hover:border-aquaBlue hover:text-oceanBlue"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Panel body */}
              <div className="flex-1 space-y-6 p-6">
                {/* Surface hero */}
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-oceanBlue to-aquaBlue p-5 text-white shadow-[0_12px_32px_rgba(0,119,182,0.22)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                      Superficie totale
                    </p>
                    <p className="mt-1 text-4xl font-black">
                      {Number(parcel.superficie).toFixed(2)}
                      <span className="ml-1.5 text-xl font-semibold text-cyan-100">
                        ha
                      </span>
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                    <LandPlot className="h-7 w-7 text-white" />
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2">
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-oceanBlue">
                    Informations
                  </p>

                  <DetailRow
                    icon={Sprout}
                    label="Culture"
                    value={parcel.type_culture}
                  />
                  <DetailRow
                    icon={Layers}
                    label="Type de sol"
                    value={parcel.type_sol}
                  />
                  <DetailRow
                    icon={Navigation}
                    label="Latitude"
                    value={
                      parcel.latitude
                        ? `${Number(parcel.latitude).toFixed(6)}°`
                        : "—"
                    }
                  />
                  <DetailRow
                    icon={Navigation}
                    label="Longitude"
                    value={
                      parcel.longitude
                        ? `${Number(parcel.longitude).toFixed(6)}°`
                        : "—"
                    }
                  />
                </div>

                {/* État d'irrigation — UI placeholder */}
                {/* <div className="rounded-2xl border border-dashed border-aquaBlue/40 bg-iceBlue/30 p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-iceBlue text-oceanBlue">
                    <Droplets className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-midnight">
                      État d'irrigation
                    </p>
                    <p className="text-xs text-midnight/50">
                      Fonctionnalité à venir
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {['Besoins en eau', 'Dernière irrigation', 'Prochaine irrigation'].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-2.5"
                      >
                        <span className="text-xs text-midnight/60">{item}</span>
                        <span className="h-4 w-16 animate-pulse rounded-full bg-iceBlue" />
                      </div>
                    )
                  )}
                </div>
              </div> */}
              </div>
              <div className="p-4 pt-0">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-oceanBlue"></p>
                <ParcelViewMap parcel={parcel} />
              </div>
            </div>

            {/* Panel footer */}
            <div className="border-t border-iceBlue bg-white/80 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-iceBlue bg-white px-5 py-3 text-sm font-semibold text-midnight transition hover:border-aquaBlue hover:text-oceanBlue"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
