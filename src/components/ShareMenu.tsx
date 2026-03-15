import { useEffect, useRef } from "react";
import type { ProductModel, ModelId, Configuration, CustomTextData } from "../types";
import { toast } from "../utils/toast";
import { buildShareableUrl } from "../utils/configSerializer";
import { useTranslation } from "../i18n";

interface ShareMenuProps {
  productModel: ProductModel;
  modelId?: ModelId;
  config: Configuration;
  customText?: CustomTextData | null;
  onClose: () => void;
}

export function ShareMenu({
  productModel,
  modelId,
  config,
  customText,
  onClose,
}: ShareMenuProps) {
  const { t } = useTranslation();
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
      toast.success(successMessage);
    } catch {
      toast.copyFallback(text, t("toast.copyManually"));
    }
    onClose();
  };

  const handleCopyModelId = () => {
    copyToClipboard(productModel.fullCode, t("share.modelCopied"));
  };

  const handleCopyURL = () => {
    if (!modelId) {
      toast.error(t("share.urlError"));
      return;
    }

    const baseUrl = `${window.location.origin}/configurator/${modelId}`;
    const url = buildShareableUrl(baseUrl, modelId, config, customText);
    copyToClipboard(url, t("share.urlCopied"));
  };

  const menuItems = [
    {
      icon: <LinkIcon />,
      label: t("share.copyUrl"),
      onClick: handleCopyURL,
    },
    {
      icon: <CopyIcon />,
      label: t("share.copyModelId"),
      onClick: handleCopyModelId,
    },
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
        aria-label={t("share.menuTitle")}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
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