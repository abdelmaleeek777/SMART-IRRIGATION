import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(118deg,#d8f1fb_0%,#e9f7fc_38%,#f7fbfc_72%,#ffffff_100%)] text-midnight lg:pl-[19rem]">
      {/* <div className="pointer-events-none absolute -left-28 top-10 h-96 w-96 rounded-full bg-aquaBlue/28 blur-[120px]" /> */}
      {/* <div className="pointer-events-none absolute left-1/3 top-24 h-72 w-72 rounded-full bg-iceBlue/60 blur-[110px]" /> */}
      {/* <div className="pointer-events-none absolute bottom-6 right-8 h-[30rem] w-[30rem] rounded-full bg-crystalCyan blur-[130px]" /> */}
      {/* <div className="pointer-events-none absolute top-6 left-8 h-[30rem] w-[30rem] rounded-full bg-crystalCyan/20 blur-[130px]" /> */}

      <Sidebar />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col bg-transparent text-slate-900">
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
