import { useEffect, useRef, useState } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import type { ProductModel, ModelId, Configuration, CustomTextData } from "../types";
import { toast } from "../utils/toast";
import { downloadProductPdf, printProductPdf } from "../utils/generateProductPdf";
import { stripHtml } from "../utils/stripHtml";
import { getModelSummary } from "../utils/getModelSummary";
import { getHeroDescription } from "../utils/getHeroDescription";
import { isIOSInAppBrowser } from "../utils/detectWebView";
import { useTranslation, useLanguage } from "../i18n";
import type { ProductPdfData } from "./ProductPdfDocument";

interface PdfMenuProps {
  productModel: ProductModel;
  modelId?: ModelId;
  config: Configuration;
  customText?: CustomTextData | null;
  onClose: () => void;
  productName?: string;
  productDescription?: string;
  productImageUrl?: string | null;
}

export function PdfMenu({
  productModel,
  modelId,
  onClose,
  productName,
  productDescription,
  productImageUrl,
}: PdfMenuProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showWebViewBanner, setShowWebViewBanner] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showWebViewBanner) {
          setShowWebViewBanner(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showWebViewBanner]);

  useEffect(() => {
    const firstButton = menuRef.current?.querySelector("button");
    firstButton?.focus();
  }, []);

  const getPdfData = async (): Promise<ProductPdfData> => {
    const logoUrl = `${window.location.origin}/pdf-logo.png`;
    const currentLang = lang as "en" | "uk";

    let modelDescription: string | null = null;
    if (modelId) {
      modelDescription = await getModelSummary(
        productModel.fullCode,
        modelId,
        currentLang
      );
    }

    const descriptionLabel = t("pdf.descriptionLabel");
    const modelNumberLabel = t("pdf.modelNumberLabel");

    let heroDescription = "";
    if (modelId) {
      const localizedHeroDescription = await getHeroDescription(modelId, currentLang);
      heroDescription = localizedHeroDescription
        ? stripHtml(localizedHeroDescription)
        : (productDescription ? stripHtml(productDescription) : "");
    } else {
      heroDescription = productDescription ? stripHtml(productDescription) : "";
    }

    const localizedProductName = t("meta.name");
    const finalProductName = localizedProductName !== "meta.name"
      ? localizedProductName
      : (productName ?? t("share.defaultProductName"));

    return {
      productName: finalProductName,
      modelNumber: productModel.fullCode,
      modelNumberLabel,
      description: heroDescription,
      modelDescription,
      descriptionLabel,
      imageUrl: productImageUrl ? `${window.location.origin}${productImageUrl}` : null,
      logoUrl,
    };
  };

  const handleSavePDF = async () => {
    if (isGeneratingPdf) return;

    if (isIOSInAppBrowser()) {
      setIsCopied(false);
      setShowWebViewBanner(true);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfData = await getPdfData();
      await downloadProductPdf(pdfData);
      toast.success(t("share.pdfDownloaded"));
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(t("share.pdfError"));
    } finally {
      setIsGeneratingPdf(false);
      onClose();
    }
  };

  const handlePrint = async () => {
    if (isGeneratingPdf) return;

    setIsGeneratingPdf(true);
    try {
      const pdfData = await getPdfData();
      await printProductPdf(pdfData);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(t("share.pdfError"));
    } finally {
      setIsGeneratingPdf(false);
      onClose();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
      }
    }
  };

  const menuItems = [
    {
      icon: <SaveIcon />,
      label: isGeneratingPdf ? t("share.generating") : t("share.savePdf"),
      onClick: handleSavePDF,
      disabled: isGeneratingPdf,
    },
    {
      icon: <PrintIcon />,
      label: t("share.print"),
      onClick: handlePrint,
      disabled: isGeneratingPdf,
    },
  ];

  if (showWebViewBanner) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-sm shadow-xl">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                {lang === "uk" ? "Відкрийте в браузері" : "Open in browser"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowWebViewBanner(false);
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-slate-900 rounded-sm hover:bg-slate-100 transition-colors"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-5 flex flex-col gap-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === "uk"
                ? "Завантаження PDF не підтримується у вбудованому браузері. Скопіюйте посилання нижче та відкрийте його в Safari — файл можна буде зберегти через меню «Поділитися»."
                : "PDF download is not supported in the in-app browser. Copy the link below and open it in Safari — you can save the file via the Share menu."}
            </p>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="w-full flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-sm px-3 py-2.5 text-left hover:bg-slate-100 transition-colors active:bg-slate-200"
            >
              <span className="text-[11px] font-mono text-slate-500 truncate flex-1 select-all">
                {shareUrl}
              </span>
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              )}
            </button>

            {isCopied && (
              <p className="text-[11px] text-green-600 font-medium">
                {lang === "uk" ? "Скопійовано" : "Copied"}
              </p>
            )}
          </div>

          <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowWebViewBanner(false);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors"
            >
              {t("common.close")}
            </button>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3" />
                  {lang === "uk" ? "Скопійовано" : "Copied"}
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  {lang === "uk" ? "Копіювати посилання" : "Copy link"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        aria-label="PDF"
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-gray-100
                       text-sm text-gray-700 flex items-center gap-3
                       focus:bg-gray-100 focus:outline-none
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={item.onClick}
            disabled={item.disabled}
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