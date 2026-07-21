import { navigation } from "../../../constants/navigation";

export default function MobileMenu({ onNavigate }) {
  return (
    <nav id="mobile-navigation" className="border-t bg-white shadow-lg lg:hidden">

      {navigation.map((item) => (
        <a
          key={item.name}
          href={item.path}
          onClick={onNavigate}
          className="block border-b px-6 py-4 text-sm font-semibold tracking-wide text-gray-800 transition hover:bg-blue-50 hover:text-[#3D87F5]"
        >
          {item.name}
        </a>
      ))}

    </nav>
  );
}
