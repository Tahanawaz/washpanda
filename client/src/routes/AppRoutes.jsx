import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Website Pages
const Home = lazy(() => import("../pages/Home"));
const Booking = lazy(() => import("../pages/Booking"));
const Login = lazy(() => import("../pages/Login"));
const SetupAdmin = lazy(() => import("../pages/SetupAdmin"));
const LegalPage = lazy(() => import("../pages/LegalPage"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Dashboard Pages
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Bookings = lazy(() => import("../pages/dashboard/Bookings"));
const BookingDetails = lazy(() => import("../pages/dashboard/BookingDetails"));
const Packages = lazy(() => import("../pages/dashboard/Packages"));
const Gallery = lazy(() => import("../pages/dashboard/Gallery"));
const Reviews = lazy(() => import("../pages/dashboard/Reviews"));
const Contacts = lazy(() => import("../pages/dashboard/Contacts"));
const Profile = lazy(() => import("../pages/dashboard/Profile"));
const WebsiteSettings = lazy(() => import("../pages/dashboard/WebsiteSettings"));

// Layouts
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center bg-[#f5f9fc]"><span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#4B95D1]" aria-label="Loading page" /></div>}><Routes>
      {/* Customer Website */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/privacy-policy" element={<LegalPage type="privacy" />} />
        <Route path="/terms-and-conditions" element={<LegalPage type="terms" />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={<Login />} />
      <Route path="/setup-admin" element={<SetupAdmin />} />

      {/* Admin Dashboard */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/bookings" element={<Bookings />} />
        <Route path="/dashboard/bookings/:id" element={<BookingDetails />} />
        <Route path="/dashboard/packages" element={<Packages />} />
        <Route path="/dashboard/gallery" element={<Gallery />} />
        <Route path="/dashboard/reviews" element={<Reviews />} />
        <Route path="/dashboard/contacts" element={<Contacts />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/settings" element={<WebsiteSettings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes></Suspense>
  );
}
