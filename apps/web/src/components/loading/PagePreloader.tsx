export function PagePreloader({ label = 'Đang tải trang...' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-5 py-12">
      <img src="/courtMate_logo.png" alt="CourtMate" className="h-14 w-14 object-contain motion-safe:animate-pulse" />
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <span aria-hidden="true" className="h-1 w-24 overflow-hidden rounded-full bg-blue-100"><span className="block h-full w-1/2 rounded-full bg-primary motion-safe:animate-pulse" /></span>
    </div>
  );
}
