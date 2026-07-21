export default function Modal({
  children,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white rounded-2xl p-8">
        {children}
      </div>
    </div>
  );
}