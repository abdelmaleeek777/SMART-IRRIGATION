import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function ParcelDeleteModal({ isOpen, parcelName, onClose, onConfirm }) {
  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Fermer la confirmation"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#023047]/35 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative z-10 w-full max-w-md rounded-[2rem] border border-iceBlue bg-arcticWhite p-6 shadow-[0_24px_70px_rgba(2,48,71,0.18)]"
          >
            {/* Icon */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-oceanBlue">
              Suppression
            </p>
            <h3 className="mt-2 text-2xl font-bold text-midnight">
              Supprimer cette parcelle ?
            </h3>
            <p className="mt-3 text-sm leading-6 text-midnight/70">
              Cette action supprimera définitivement la parcelle
              {parcelName ? (
                <strong className="font-semibold text-midnight"> {parcelName}</strong>
              ) : ''}
              . Cette opération ne peut pas être annulée.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                id="cancel-delete-parcel"
                onClick={onClose}
                className="rounded-xl border border-iceBlue bg-white px-5 py-3 text-sm font-semibold text-midnight transition hover:border-aquaBlue"
              >
                Annuler
              </button>
              <button
                type="button"
                id="confirm-delete-parcel"
                onClick={onConfirm}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(220,38,38,0.25)] transition hover:scale-[1.01] hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
