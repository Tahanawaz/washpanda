import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminProfile } from "../services/api";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (status !== "checking") return undefined;
    let active = true;
    getAdminProfile()
      .then(() => { if (active) setStatus("authenticated"); })
      .catch(() => {
        if (active) setStatus("unauthenticated");
      });
    return () => { active = false; };
  }, [status]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8fc]">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#4B95D1]" />
          <p className="mt-4 text-sm font-semibold text-gray-500">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
