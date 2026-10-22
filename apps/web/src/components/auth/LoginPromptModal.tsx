'use client';
import { Modal } from 'antd';
import { X } from 'lucide-react';
import { AuthCard } from './AuthCard';
interface LoginPromptModalProps { isOpen: boolean; onClose: () => void; title?: string; description?: string; }
export function LoginPromptModal({isOpen,onClose}: LoginPromptModalProps){
  return <Modal open={isOpen} onCancel={onClose} footer={null} centered width={866} destroyOnClose className="cm-auth-modal" wrapClassName="cm-auth-wrap" title={<span className="sr-only">Tài khoản CourtMate</span>} closeIcon={<X size={20}/>}><AuthCard onSuccess={onClose}/></Modal>;
}
