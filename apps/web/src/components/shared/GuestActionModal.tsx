'use client';

import React, { useEffect, useId } from 'react';
import { Modal } from 'antd';
import { TriangleAlert } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';


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
      styles={{ content: { padding: 32, borderRadius: 'var(--cm-radius-feature)' } }}
    >
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-tan text-primary">
          <TriangleAlert size={32} aria-hidden="true" />
        </div>
        <h2 id={titleId} className="text-xl font-bold text-ink">Yêu cầu đăng nhập</h2>
        <p id={descriptionId} className="mt-2 text-sm text-muted">Bạn cần phải đăng nhập để tiếp tục</p>
        <button
          type="button"
          onClick={() => {
            onClose();
            window.dispatchEvent(new CustomEvent('courtmate:open-auth', { detail: { mode: 'login', redirect: redirectUrl } }));
          }}
          className="cm-action cm-button mt-6 w-full cursor-pointer rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Đăng nhập ngay
        </button>
      </div>
    </Modal>
  );
};
