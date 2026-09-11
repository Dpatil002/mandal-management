import React from 'react';

export function ProofModal({ isOpen, onClose, imageUrl, title = 'Payment Screenshot Proof' }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-[#FFF8F6] rounded-3xl overflow-hidden shadow-2xl border border-[#F0DFD5]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 bg-[#8B2616] text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <h4 className="text-sm font-bold">{title}</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 bg-[#241913] flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/400x500/8B2616/FFFFFF?text=Proof+Image+Uploaded';
            }}
          />
        </div>

        <div className="p-4 bg-[#FFF8F6] flex items-center justify-between border-t border-[#F0DFD5]">
          <span className="text-xs text-[#6B5E57]">PWA Encrypted Storage</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF4ED] border border-[#D9C4B7] text-[#241913] rounded-xl text-xs font-bold hover:bg-[#F0DFD5]"
          >
            बंद करा (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
