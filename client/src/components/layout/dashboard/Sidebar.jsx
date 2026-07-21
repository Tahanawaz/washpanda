import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  LuGalleryHorizontal,
  LuLayoutDashboard,
  LuLogOut,
  LuMessageSquare,
  LuPackage,
  LuShoppingCart,
  LuStar,
  LuSettings,
  LuX,
} from "react-icons/lu";
import { logoutAdmin } from "../../../services/api";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: LuLayoutDashboard, end: true },
  { label: "Bookings", to: "/dashboard/bookings", icon: LuShoppingCart },
  { label: "Packages", to: "/dashboard/packages", icon: LuPackage },
  { label: "Reviews", to: "/dashboard/reviews", icon: LuStar },
  { label: "Gallery", to: "/dashboard/gallery", icon: LuGalleryHorizontal },
  { label: "Contacts", to: "/dashboard/contacts", icon: LuMessageSquare },
  { label: "Settings", to: "/dashboard/settings", icon: LuSettings },
];

export default function Sidebar({ mobile = false, onClose }) {
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await logoutAdmin();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside className={`${mobile ? "flex h-[100dvh] w-[280px]" : "hidden h-screen w-[240px] lg:flex xl:w-[260px]"} relative shrink-0 flex-col overflow-hidden border-r border-slate-100 bg-white px-4 py-3 xl:px-5`}>
      {mobile && <button type="button" onClick={onClose} aria-label="Close dashboard menu" className="absolute right-4 top-4 rounded-xl bg-gray-100 p-2 text-gray-500"><LuX size={20} /></button>}
      <a href="/" className="mb-3 flex shrink-0 justify-center" aria-label="Wash Panda home">
        <img src="/logo.png" alt="Wash Panda" className="h-20 w-24 object-contain" />
      </a>

      <p className="mb-2 shrink-0 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Management</p>
      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain pr-1">
        {links.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#4B95D1] text-white shadow-[0_8px_20px_rgba(75,149,209,0.24)]"
                  : "text-slate-600 hover:bg-blue-50 hover:text-[#287fbd]"
              }`
            }
          >
            <Icon size={21} strokeWidth={1.9} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-3 shrink-0 border-t border-gray-100 pt-3">
        <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-500 transition hover:bg-red-50 hover:text-red-500">
          <LuLogOut size={21} strokeWidth={1.9} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
