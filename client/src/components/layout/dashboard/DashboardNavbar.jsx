import { useCallback, useEffect, useState } from "react";
import { LuBell, LuCalendarCheck, LuChevronDown, LuLogOut, LuMaximize, LuMenu, LuMessageSquare, LuRefreshCw, LuSearch, LuUser } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { ADMIN_PROFILE_UPDATED_EVENT, getAdminProfile } from "../../../services/adminProfileStorage";
import { getBookings, getContacts, logoutAdmin, markBookingNotificationSeen, markContactNotificationSeen } from "../../../services/api";

export default function DashboardNavbar({ search, onSearchChange, onMenuClick }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(getAdminProfile);
  const [notifications, setNotifications] = useState({ bookings: [], contacts: [] });
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    try {
      const [bookingPayload, contactPayload] = await Promise.all([getBookings(), getContacts()]);
      const nextNotifications = {
        bookings: bookingPayload.data.filter((booking) => !booking.notificationSeen),
        contacts: contactPayload.data.filter((contact) => !contact.notificationSeen),
      };
      setNotifications(nextNotifications);
      return nextNotifications;
    } catch {
      const emptyNotifications = { bookings: [], contacts: [] };
      setNotifications(emptyNotifications);
      return emptyNotifications;
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshProfile = () => setProfile(getAdminProfile());
    window.addEventListener(ADMIN_PROFILE_UPDATED_EVENT, refreshProfile);
    window.addEventListener("storage", refreshProfile);
    return () => {
      window.removeEventListener(ADMIN_PROFILE_UPDATED_EVENT, refreshProfile);
      window.removeEventListener("storage", refreshProfile);
    };
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadNotifications, 0);
    const timer = window.setInterval(loadNotifications, 30000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [loadNotifications]);

  const notificationCount = notifications.bookings.length + notifications.contacts.length;

  const toggleNotifications = async () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (!opening) return;
    await loadNotifications();
  };

  const openBookingNotification = async (booking) => {
    if (!booking.notificationSeen) {
      try {
        await markBookingNotificationSeen(booking.orderNumber);
        setNotifications((current) => ({
          ...current,
          bookings: current.bookings.filter((item) => item._id !== booking._id),
        }));
      } catch {
        // Navigation still works; a later refresh will retry the unread state.
      }
    }
    setNotificationsOpen(false);
    navigate(`/dashboard/bookings/${booking.orderNumber}`);
  };

  const openContactNotification = async (contact) => {
    if (!contact.notificationSeen) {
      try {
        await markContactNotificationSeen(contact._id);
        setNotifications((current) => ({
          ...current,
          contacts: current.contacts.filter((item) => item._id !== contact._id),
        }));
      } catch {
        // Navigation still works; a later refresh will retry the unread state.
      }
    }
    setNotificationsOpen(false);
    navigate("/dashboard/contacts");
  };

  const signOut = async () => {
    try {
      await logoutAdmin();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  return (
    <header className="flex h-20 items-center gap-3 bg-white px-4 sm:h-24 sm:gap-5 sm:px-8 xl:px-10">
      <button type="button" onClick={onMenuClick} aria-label="Open dashboard menu" className="rounded-xl bg-blue-50 p-2.5 text-[#4B95D1] lg:hidden"><LuMenu size={22} /></button>
      <h1 className="mr-auto text-xl font-bold text-[#222] sm:text-2xl">Dashboard</h1>

      <label className="hidden h-10 w-full max-w-[430px] items-center gap-2.5 rounded-lg border border-gray-400 px-4 md:flex">
        <LuSearch size={21} className="text-[#4B95D1]" />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} type="search" placeholder="Search bookings..." className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-500" />
      </label>

      <button type="button" onClick={toggleFullscreen} aria-label="Toggle full screen" className="hidden p-2 text-gray-600 transition hover:text-[#4B95D1] sm:block">
        <LuMaximize size={24} />
      </button>
      <div className="relative">
        <button type="button" onClick={toggleNotifications} aria-label={`${notificationCount} notifications`} className="relative rounded-lg bg-blue-50 p-3 text-[#4B95D1]">
          <LuBell size={23} />
          {notificationCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{notificationCount > 99 ? "99+" : notificationCount}</span>}
        </button>
        {notificationsOpen && (
          <div className="absolute right-0 top-14 z-50 w-[350px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:w-[390px]">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <p className="font-bold text-gray-800">Notifications</p>
                <p className="mt-0.5 text-xs text-gray-500">{notificationCount} item{notificationCount === 1 ? "" : "s"} need attention</p>
              </div>
              <button type="button" onClick={loadNotifications} aria-label="Refresh notifications" className="rounded-lg p-2 text-[#4B95D1] transition hover:bg-blue-50"><LuRefreshCw className={notificationsLoading ? "animate-spin" : ""} size={18} /></button>
            </div>

            <div className="max-h-[410px] overflow-y-auto p-2">
              {notifications.bookings.slice(0, 4).map((booking) => (
                <button key={booking._id} type="button" onClick={() => openBookingNotification(booking)} className="flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-blue-50">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#3d8dcb]"><LuCalendarCheck size={19} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800">New booking #{booking.orderNumber}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">{booking.customer?.fullName} · {booking.washPackage?.name}</span>
                    <span className="mt-1 block text-[11px] text-gray-400">{formatNotificationDate(booking.createdAt)}</span>
                  </span>
                  {!booking.notificationSeen && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4B95D1]" />}
                </button>
              ))}

              {notifications.contacts.slice(0, 4).map((contact) => (
                <button key={contact._id} type="button" onClick={() => openContactNotification(contact)} className="flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-emerald-50">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><LuMessageSquare size={19} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800">New message from {contact.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">{contact.message}</span>
                    <span className="mt-1 block text-[11px] text-gray-400">{formatNotificationDate(contact.createdAt)}</span>
                  </span>
                  {!contact.notificationSeen && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                </button>
              ))}

              {!notificationsLoading && notificationCount === 0 && (
                <div className="px-5 py-10 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"><LuBell size={21} /></span>
                  <p className="mt-3 text-sm font-semibold text-gray-700">You’re all caught up</p>
                  <p className="mt-1 text-xs text-gray-400">No new bookings or messages.</p>
                </div>
              )}
            </div>

            {notificationCount > 0 && (
              <div className="grid grid-cols-2 border-t border-gray-100 bg-gray-50/80 p-2">
                <button type="button" onClick={() => { setNotificationsOpen(false); navigate("/dashboard/bookings"); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#4B95D1] hover:bg-white">View bookings</button>
                <button type="button" onClick={() => { setNotificationsOpen(false); navigate("/dashboard/contacts"); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-white">View messages</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative hidden xl:block">
        <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-3 text-left">
          <img src={profile.avatar} alt={profile.name} className="h-12 w-12 rounded-xl object-cover" />
          <div>
            <p className="max-w-32 truncate font-semibold text-[#4B95D1]">{profile.name}</p>
            <p className="max-w-32 truncate text-sm text-gray-500">{profile.role}</p>
          </div>
          <LuChevronDown className="ml-4 text-[#4B95D1]" />
        </button>
        {profileOpen && (
          <div className="absolute right-0 top-16 z-50 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
            <button type="button" onClick={() => { setProfileOpen(false); navigate('/dashboard/profile'); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50"><LuUser /> Manage Profile</button>
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50"><LuLogOut /> Sign Out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function formatNotificationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString("en-PK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
