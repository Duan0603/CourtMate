export function ContentSkeleton({ layout = 'cards', count = 6 }: { layout?: 'cards' | 'tournaments' | 'matches'; count?: number }) {
  const grid = layout === 'tournaments' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : layout === 'matches' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  return (
    <div role="status" aria-label="Đang tải danh sách" aria-busy="true" className={`grid gap-4 sm:gap-5 ${grid}`}>
      <span className="sr-only">Đang tải nội dung...</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-card motion-safe:animate-pulse">
          <div className={`${layout === 'matches' ? 'h-16' : 'h-44'} bg-slate-200/70`} />
          <div className="space-y-4 p-5"><div className="h-5 w-4/5 rounded bg-slate-200" /><div className="h-4 w-3/5 rounded bg-slate-100" /><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="border-t border-slate-100 pt-4"><div className="h-9 w-full rounded-lg bg-slate-100" /></div></div>
        </div>
      ))}
    </div>
  );
}
