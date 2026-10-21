export function ContentSkeleton({
  layout = 'cards',
  count = 6,
}: {
  layout?: 'cards' | 'tournaments' | 'matches' | 'coaches';
  count?: number;
}) {
  const gridClass =
    layout === 'tournaments'
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      : layout === 'matches'
      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      : layout === 'coaches'
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div
      role="status"
      aria-label="Đang tải danh sách"
      aria-busy="true"
      className={`grid gap-5 ${gridClass}`}
    >
      <span className="sr-only">Đang tải nội dung...</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] p-5 overflow-hidden motion-safe:animate-pulse flex flex-col justify-between"
        >
          {layout === 'tournaments' ? (
            <div className="space-y-4">
              {/* Image banner skeleton */}
              <div className="h-36 w-full rounded-xl bg-slate-200 border-2 border-black/10" />
              {/* Sport badge & Title */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 rounded-md bg-slate-200" />
                <div className="h-5 w-24 rounded-md bg-slate-100" />
              </div>
              <div className="h-6 w-5/6 rounded-lg bg-slate-200" />
              {/* Location & date */}
              <div className="space-y-2 pt-2 border-t-2 border-dashed border-slate-200">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ) : layout === 'matches' ? (
            <div className="space-y-4">
              {/* Match Header */}
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 rounded-md bg-slate-200" />
                <div className="h-6 w-24 rounded-full bg-slate-100" />
              </div>
              {/* Title & Host */}
              <div className="h-6 w-4/5 rounded-lg bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-100" />
              {/* Location & Court */}
              <div className="p-3 bg-slate-50 rounded-xl border border-black/10 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
              </div>
              {/* Footer CTA */}
              <div className="flex items-center justify-between pt-3 border-t-2 border-black/10">
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="h-9 w-28 rounded-xl bg-slate-200" />
              </div>
            </div>
          ) : layout === 'coaches' ? (
            <div className="space-y-4">
              {/* Coach Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 border-2 border-black/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
              {/* Sports & Rating */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-md bg-slate-200" />
                  <div className="h-5 w-20 rounded-md bg-slate-100" />
                </div>
                <div className="h-5 w-14 rounded-md bg-slate-200" />
              </div>
              {/* Headline */}
              <div className="h-10 w-full rounded-lg bg-slate-100" />
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-black/10">
                <div className="h-6 w-24 rounded bg-slate-200" />
                <div className="h-10 w-32 rounded-xl bg-slate-200" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-32 w-full rounded-xl bg-slate-200" />
              <div className="h-5 w-4/5 rounded bg-slate-200" />
              <div className="h-4 w-3/5 rounded bg-slate-100" />
              <div className="h-9 w-full rounded-xl bg-slate-200 mt-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

