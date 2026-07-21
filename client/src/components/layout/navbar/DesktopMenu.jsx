import { navigation } from "../../../constants/navigation";

export default function DesktopMenu() {
  return (
    <ul className="flex items-center gap-7 xl:gap-10">
      {navigation.map((item) => (
        <li key={item.name}>
          <a
            href={item.path}
            className="
            text-[11px]
            font-semibold
            tracking-widest
            text-gray-800
            hover:text-[#3D87F5]
            transition-all
          "
          >
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
