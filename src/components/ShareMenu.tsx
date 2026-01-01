import { useEffect, useRef } from "react";
import type { ProductModel, ModelId } from "../types";

interface ShareMenuProps {
  productModel: ProductModel;
  modelId?: ModelId;
  onClose: () => void;
}

export function ShareMenu({ productModel, modelId, onClose }: ShareMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const firstButton = menuRef.current?.querySelector("button");
    firstButton?.focus();
  }, []);

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(successMessage);
    } catch {
      prompt("Copy this:", text);
    }
    onClose();
  };

  const handleCopyModelId = () => {
    copyToClipboard(productModel.fullCode, "Model ID copied to clipboard!");
  };

  const handleCopyURL = () => {
    const baseUrl = `${window.location.origin}/configurator`;
    const params = new URLSearchParams({
      ...(modelId && { model: modelId }),
      code: productModel.fullCode,
    });
    const url = `${baseUrl}?${params.toString()}`;
    copyToClipboard(url, "URL copied to clipboard!");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(
      `Product Configuration: ${productModel.fullCode}`
    );
    const shareUrl = `${window.location.origin}/configurator?code=${productModel.fullCode}`;
    const body = encodeURIComponent(
      `I've configured a product:\n\n` +
        `Model: ${productModel.fullCode}\n\n` +
        `View configuration: ${shareUrl}\n\n` +
        `---\n` +
        `Sent from Build It Configurator`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onClose();
  };

  const handlePrint = () => {
    window.print();
    onClose();
  };

  const handleSavePDF = () => {
    window.print();
    onClose();
  };

  const menuItems = [
    { icon: <EmailIcon />, label: "Email", onClick: handleEmail },
    { icon: <SaveIcon />, label: "Save PDF", onClick: handleSavePDF },
    { icon: <PrintIcon />, label: "Print", onClick: handlePrint },
    { icon: <LinkIcon />, label: "Copy URL", onClick: handleCopyURL },
    { icon: <CopyIcon />, label: "Copy Model ID", onClick: handleCopyModelId },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={menuRef}
        className="absolute top-full right-0 mt-2 bg-white border border-gray-200 
                   rounded-lg shadow-lg py-1 w-44 z-20"
        role="menu"
        aria-label="Share options"
      >
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-gray-100 
                       text-sm text-gray-700 flex items-center gap-3
                       focus:bg-gray-100 focus:outline-none"
            onClick={item.onClick}
            role="menuitem"
            tabIndex={index === 0 ? 0 : -1}
          >
            <span className="w-4 h-4 text-gray-500">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function EmailIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}