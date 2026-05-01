export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/75 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" aria-label="Loading" />
        <p className="text-sm font-semibold text-primary">Loading page...</p>
      </div>
    </div>
  );
}
