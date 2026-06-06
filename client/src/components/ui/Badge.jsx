export function Badge({ className, children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${className}`}>
      {children}
    </span>
  );
}