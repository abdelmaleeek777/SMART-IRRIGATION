import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../services/api';

const pageTitleMap = {
  '/dashboard': 'Tableau de bord',
  '/exploitations': 'Exploitations',
  '/parcels': 'Parcelles',
  '/recommendations': 'Recommandations',
  '/histrique-recommandations': 'Historique recommandations',
};

export default function Header() {
  const location = useLocation();
  const currentTitle = pageTitleMap[location.pathname] || '';
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    apiRequest('/auth/me')
      .then((data) => {
        if (isMounted) setUser(data);
      })
      .catch((err) => {
        console.error('Failed to fetch user in header:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const userInitial = user?.prenom ? user.prenom[0].toUpperCase() : 'A';
  const userFullName = user ? `${user.prenom} ${user.nom}` : '';
  const userEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-20 w-full px-4 pt-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="flex items-center justify-between px-6 py-4 rounded-2xl border border-slate-200/80 bg-white/85 backdrop-blur-md shadow-[0_18px_60px_rgba(2,48,71,0.06)]">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
            Gestion de l'irrigation
          </span>
          <div className="overflow-hidden mt-0.5">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentTitle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-extrabold text-slate-900 sm:text-2xl tracking-tight"
              >
                {currentTitle}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-sky-100 bg-sky-50/60 px-3.5 py-1.5 text-xs font-semibold text-[#0077B6] backdrop-blur-md transition-all duration-300 hover:bg-sky-100/60 md:flex">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#0077B6]"></span>
            </span>
            <span>Service Météo Connecté</span>
          </div>

          <div className="group relative flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-br from-[#0077B6] to-[#00B4D8] font-bold text-white shadow-[0_6px_20px_rgba(0,119,182,0.15)] ring-2 ring-sky-50 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,119,182,0.3)]"
            >
              {userInitial}
            </motion.div>

            {/* Dropdown on Hover */}
            <div className="pointer-events-none absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_40px_rgba(2,48,71,0.12)] opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 z-30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Agriculteur</p>
              {user ? (
                <>
                  <p className="mt-1 text-sm font-bold text-slate-900 truncate" title={userFullName}>
                    {userFullName}
                  </p>
                  <p className="text-xs text-slate-500 truncate" title={userEmail}>
                    {userEmail}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-slate-500 animate-pulse">Chargement...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}



