'use client';

import { useEffect, useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PagePreloader } from '../components/loading/PagePreloader';
import { useLoading } from '../context/LoadingContext';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [retrying, startTransition] = useTransition();
  const { cancelNavigation } = useLoading();
  useEffect(() => { cancelNavigation(); }, [cancelNavigation]);

  if (retrying) return <PagePreloader label="Đang tải lại trang..." />;
  return (
    <div role="alert" className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
      <AlertTriangle size={32} className="mb-5 text-primary" />
      <h1 className="text-xl font-bold text-ink">Trang chưa thể hiển thị</h1>
      <p className="mt-3 text-sm leading-6 text-muted">Đã có lỗi khi tải nội dung. Bạn có thể thử tải lại trang.</p>
      <button type="button" onClick={() => startTransition(reset)} className="cm-action cm-button mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">Thử tải lại</button>
    </div>
  );
}
