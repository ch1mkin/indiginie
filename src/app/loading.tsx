export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="chirag-loader" aria-label="Loading">
          <div className="chirag-flame" />
          <div className="chirag-bowl" />
        </div>
        <p className="text-sm font-semibold text-primary">Loading page...</p>
      </div>
    </div>
  );
}
