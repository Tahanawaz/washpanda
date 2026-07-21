import { useState } from "react";
import { HiBars3, HiXMark } from "react-icons/hi2";

import Container from "../../common/Container";

import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";
import ContactInfo from "./ContactInfo";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">

      <Container>

        <div className="relative flex h-24 items-center justify-between px-4 sm:px-8 lg:px-12">

          <Logo />

          <div className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <DesktopMenu />
          </div>

          <div className="ml-auto flex items-center gap-6">

            <ContactInfo />

            <button
              type="button"
              className="rounded-md p-2 text-gray-800 transition hover:bg-gray-100 lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              {open ? (
                <HiXMark size={30} />
              ) : (
                <HiBars3 size={30} />
              )}
            </button>

          </div>

        </div>

      </Container>

      {open && <MobileMenu onNavigate={() => setOpen(false)} />}

    </header>
  );
}
