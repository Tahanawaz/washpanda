export default function Button({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition ${className}`}
    >
      {children}
    </button>
  );
}