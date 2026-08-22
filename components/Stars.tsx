export default function Stars({
  rating,
  className = "text-accent text-xs tracking-tight",
}: {
  rating: number;
  className?: string;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className={className}>
      {"★".repeat(full)}
      {half && "½"}
    </span>
  );
}
