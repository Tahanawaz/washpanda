export default function Section({
  children,
  className = "",
}) {
  return (
    <section className={`py-20 ${className}`}>
      {children}
    </section>
  );
}