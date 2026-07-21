import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/dashboard/Sidebar";
import DashboardNavbar from "../components/layout/dashboard/DashboardNavbar";

export default function DashboardLayout() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="flex min-h-screen bg-[#F7F7F7] lg:h-screen lg:overflow-hidden">

      <Sidebar />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[300] flex bg-slate-950/45 backdrop-blur-sm lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}>
          <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <div className="min-w-0 flex-1 lg:h-screen">

        <DashboardNavbar search={searchInput} onSearchChange={setSearchInput} onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="p-4 sm:p-5 lg:h-[calc(100vh-96px)] lg:overflow-auto xl:p-6">
          <Outlet context={{ search }} />
        </main>

      </div>

    </div>
  );
}
