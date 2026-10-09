import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showClose = true,
}) => {
  const overlayRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-card-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col animate-slide-up`}>
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-5 border-b border-neutral-200">
            {title && <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors ml-auto"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-neutral-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>
    }
  >
    {description && <p className="text-neutral-600">{description}</p>}
  </Modal>
);

export default Modal;
