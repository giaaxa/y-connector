export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-5 py-16 sm:px-8" aria-busy="true" aria-label="Loading events">
      <div className="h-12 w-1/2 rounded-lg bg-fog" />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-72 rounded-2xl bg-fog" />)}
      </div>
    </div>
  );
}
