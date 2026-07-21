import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="/logo.png"
        alt="Wash Panda"
        className="h-20 w-44 object-contain sm:w-48"
      />
    </Link>
  );
}
