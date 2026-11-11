export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-32 rounded bg-fog" />
      <div className="h-9 w-2/3 rounded-lg bg-fog" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-44 rounded-2xl bg-fog lg:col-span-2" />
        <div className="h-44 rounded-2xl bg-fog" />
      </div>
      <div className="h-64 rounded-2xl bg-fog" />
    </div>
  );
}
