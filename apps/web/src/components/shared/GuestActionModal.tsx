'use client';

import React, { useEffect, useId } from 'react';
import { Modal } from 'antd';
import { TriangleAlert } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { useRouter } from 'next/navigation';

interface GuestActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  redirectUrl?: string;
}

export const GuestActionModal: React.FC<GuestActionModalProps> = ({
  isOpen,
  onClose,
  redirectUrl = '/coaches',
}) => {
  const router = useRouter();
  const { cancelNavigation } = useLoading();
  useEffect(() => { if (isOpen) cancelNavigation(); }, [isOpen, cancelNavigation]);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      maskClosable
      keyboard
      centered
      width={400}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      styles={{ content: { padding: 32, borderRadius: 24 } }}
    >
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <TriangleAlert size={32} aria-hidden="true" />
        </div>
        <h2 id={titleId} className="text-xl font-bold text-slate-900">Yêu cầu đăng nhập</h2>
        <p id={descriptionId} className="mt-2 text-sm text-slate-500">Bạn cần phải đăng nhập để tiếp tục</p>
        <button
          type="button"
          onClick={() => {
            onClose();
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
          }}
          className="mt-6 w-full cursor-pointer rounded-xl bg-[#1E5AA8] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#154687] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Đăng nhập ngay
        </button>
      </div>
    </Modal>
  );
};
