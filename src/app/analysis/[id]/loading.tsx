export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-10 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-5 bg-muted rounded w-3/4" />
      </div>
      <div className="h-48 bg-muted rounded-xl" />
      <div className="h-32 bg-muted rounded" />
      <div className="h-32 bg-muted rounded" />
    </div>
  );
}
