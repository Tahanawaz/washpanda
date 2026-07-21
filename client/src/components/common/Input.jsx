export default function Input({
  label,
  type = "text",
  placeholder,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        className="
          w-full
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-blue-500
        "
        {...props}
      />
    </div>
  );
}