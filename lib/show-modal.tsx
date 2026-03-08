"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

const ModalCloseContext = createContext<() => void>(() => { });

/** 在 modal 內容元件中呼叫，取得關閉函數 */
export const useModalClose = () => useContext(ModalCloseContext);

function ModalShell({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Scroll wrapper */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-4 sm:p-6"
        onClick={onClose}
      >
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * 命令式呼叫 modal，類似 SweetAlert2
 * 內容元件可透過 `useModalClose()` 取得關閉函數
 *
 * @example
 * await showModal(<MyContent />);
 */
export function showModal(content: ReactNode): Promise<void> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
        resolve();
      }, 200);
    };

    root.render(
      <ModalCloseContext.Provider value={cleanup}>
        <ModalShell onClose={cleanup}>
          {content}
        </ModalShell>
      </ModalCloseContext.Provider>,
    );
  });
}
