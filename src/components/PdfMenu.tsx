import { useEffect, useRef, useState } from "react";
import type { ProductModel, ModelId, Configuration, CustomTextData } from "../types";
import { toast } from "../utils/toast";
import { downloadProductPdf, printProductPdf } from "../utils/generateProductPdf";
import { stripHtml } from "../utils/stripHtml";
import { getModelSummary } from "../utils/getModelSummary";
import { getHeroDescription } from "../utils/getHeroDescription";
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