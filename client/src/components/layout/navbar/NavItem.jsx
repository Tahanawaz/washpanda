import { NavLink } from "react-router-dom";

export default function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `transition-colors duration-200 font-medium ${
          isActive
            ? "text-blue-600"
            : "text-slate-700 hover:text-blue-600"
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}