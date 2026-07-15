import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
