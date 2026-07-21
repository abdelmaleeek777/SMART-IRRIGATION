import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { logout } from '../../services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuit,
  Droplets,
  History,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Sprout,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/exploitations', label: 'Exploitations', icon: Sprout },
  { to: '/parcels', label: 'Parcelles', icon: MapPinned },
  { to: '/recommendations', label: 'Recommandations', icon: BrainCircuit },
  { to: '/histrique-recommandations', label: 'Historique recommandations', icon: History },
];

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function SidebarPanel({ onNavigate }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="
        fixed
        left-4
        top-4
        z-30
        flex flex-col
        rounded-[2rem]
        px-4 py-6
        h-[calc(100vh-2rem)]
        w-72
        lg:px-5
        bg-gradient-to-br from-[#0077B6] via-[#0096C7] to-[#00B4D8]
        border border-white/25
        shadow-[0_18px_50px_rgba(0,119,182,0.20)]
        text-white
      "
    >
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_80%_8%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_15%_88%,rgba(202,240,248,0.20),transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.015 }}
          className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/12 px-3 py-2.5 backdrop-blur"
        >
          <motion.div
            whileHover={{ rotate: -10, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/18 text-cyan-100 ring-1 ring-white/35"
          >
            <Droplets className="h-5 w-5" />
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-cyan-200/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>
          <div>
            <p className="text-lg font-semibold leading-none text-white">WaterWise</p>
            <p className="mt-1 text-xs text-cyan-100/85">AI irrigation platform</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.nav
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="relative space-y-2"
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div key={item.to} variants={itemVariants}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    'group relative block overflow-hidden rounded-2xl px-3 py-3 text-sm font-medium transition-colors',
                    isActive ? 'text-[#023047]' : 'text-cyan-50/95 hover:text-white',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <motion.div
                        layoutId="activeNav"
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] shadow-[0_10px_24px_rgba(72,202,228,0.35)]"
                      />
                    ) : null}

                    

                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className={[
                        'relative z-10 flex items-center gap-3 rounded-xl px-2 py-0.5',
                         'group-hover:bg-white/10  '
                      ].join(' ')}
                    >
                      <motion.div whileHover={{ scale: 1.08 }} transition={{ duration: 0.2 }}>
                        <Icon className="h-4.5 w-4.5" />
                      </motion.div>
                      <span>{item.label}</span>
                    </motion.div>
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </motion.nav>

      <div className="relative mt-auto pt-5">
        <motion.button
          type="button"
          onClick={logout}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/12 px-4 py-3 text-sm font-medium text-white shadow-[0_8px_22px_rgba(2,48,71,0.14)] backdrop-blur transition hover:bg-white/18"
        >
          <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
            <LogOut className="h-4 w-4" />
          </motion.div>
          <span>Se déconnecter</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200 bg-white/90 text-[#0077B6] shadow-[0_10px_24px_rgba(0,119,182,0.15)] backdrop-blur lg:hidden"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block">
        <SidebarPanel />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#023047]/35 backdrop-blur-[2px] lg:hidden"
              aria-label="Fermer la navigation"
            />

            <motion.div
              initial={{ x: -320, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-screen w-[88vw] max-w-[300px] lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-7 top-7 z-50 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-white backdrop-blur"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>

              <SidebarPanel onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}



