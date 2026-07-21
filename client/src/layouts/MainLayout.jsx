import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/navbar/Navbar";
import Footer from "../components/layout/footer/Footer";

export default function MainLayout() {
  return (
    <>
      <Navbar />

      <main className="pt-24">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
