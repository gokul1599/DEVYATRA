import Link from "next/link";

/** Required Google Places attribution shown wherever discovery results are rendered. */
export function GoogleAttribution({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-[10.5px] text-ivory-dim/60"}>
      <Link
        href="https://www.google.com/maps"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 underline-offset-2 hover:text-ivory hover:underline"
      >
        Powered by Google
      </Link>
    </p>
  );
}