import { useState } from "react";
import { useLocation } from "react-router-dom";
import { X, ExternalLink, Copy, Check } from "lucide-react";
import {
  useMyList,
  useProjectMeta,
  useConfigurationStore,
} from "../stores/configurationStore";
import { useTranslation, useLanguage } from "../i18n";
import { downloadMyListXlsx } from "../utils/generateMyListXlsx";
import { buildMyListShareUrl } from "../utils/configSerializer";
import { ExportModal } from "./ExportModal";
import { toast } from "../utils/toast";

/**
 * Detects iOS in-app browsers (Telegram, Facebook, Instagram, etc.)
 * where programmatic file downloads via <a download> are broken.
 *
 * Telegram on iOS uses a plain WKWebView with a standard Safari UA string —
 * there is no "Telegram" token in navigator.userAgent, and window.safari
 * was removed by Apple in Safari 16+.
 *
 * Reliable detection: native apps that embed WKWebView register message
 * handlers via window.webkit.messageHandlers. Standalone Safari does NOT
 * have this object. If we detect iOS + messageHandlers present → in-app browser.
 */
function isIOSInAppBrowser(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  if (!isIOS) return false;

  // PWA / home screen shortcut — not an in-app browser
  if ((navigator as { standalone?: boolean }).standalone === true) return false;

  // Native apps register message handlers on WKWebView.
  // Standalone Safari does not have this object.
  const webkit = (window as { webkit?: { messageHandlers?: unknown } }).webkit;
  if (webkit && typeof webkit.messageHandlers === "object" && webkit.messageHandlers !== null) {
    return true;
  }

  return false;
}

export function StickyExportBar() {
  const location = useLocation();
  const myList = useMyList();
  const projectMeta = useProjectMeta();
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const clearMyList = useConfigurationStore((s) => s.clearMyList);
  const setProjectMeta = useConfigurationStore((s) => s.setProjectMeta);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showWebViewBanner, setShowWebViewBanner] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  if (location.pathname !== "/my-list" || myList.length === 0) return null;

  const totalUnits = myList.reduce((sum, item) => sum + item.qty, 0);

  const handleClearAll = () => {
    toast.confirm(t("myList.clearListConfirm"), () => {
      clearMyList();
    });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard API may fail in WebView — use textarea fallback
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
        // Both methods failed — the URL is displayed and can be long-pressed
      }
    }
  };

  const handleExport = async (meta: { projectName: string; clientName: string; date: string }) => {
    setProjectMeta({
      projectName: meta.projectName,
      clientName: meta.clientName,
      date: meta.date,
    });

    setIsExportModalOpen(false);

    // iOS in-app browsers cannot download files — show transfer banner
    if (isIOSInAppBrowser()) {
      const updatedMeta = {
        ...projectMeta,
        projectName: meta.projectName,
        clientName: meta.clientName,
        date: meta.date,
      };
      const url = buildMyListShareUrl(myList, updatedMeta);
      setShareUrl(url);
      setIsCopied(false);
      setShowWebViewBanner(true);
      return;
    }

    setIsDownloading(true);

    try {
      const updatedMeta = {
        ...projectMeta,
        projectName: meta.projectName,
        clientName: meta.clientName,
        date: meta.date,
      };
      await downloadMyListXlsx(myList, lang as "en" | "uk", updatedMeta);
      setProjectMeta({ lastExportedAt: Date.now(), updatedAt: Date.now() });
    } catch {
      toast.error(t("toast.errorOccurred"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-mono text-slate-500">
            {t("stickyBar.totalUnits", { count: String(totalUnits) })}
          </span>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleClearAll}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 text-sm sm:text-xs font-medium text-red-600 border border-red-200 rounded-sm hover:bg-red-50 transition-colors"
            >
              {t("myList.clearList")}
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              disabled={isDownloading}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 text-sm sm:text-xs font-medium text-white bg-brand-600 rounded-sm hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? t("common.loading") : t("myList.downloadList")}
            </button>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        projectMeta={projectMeta}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />

      {/* iOS WebView transfer banner */}
      {showWebViewBanner && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-sm shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  {lang === "uk"
                    ? "Відкрийте в браузері"
                    : "Open in browser"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowWebViewBanner(false)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-sm hover:bg-slate-100 transition-colors"
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-5 flex flex-col gap-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "uk"
                  ? "Завантаження файлів не підтримується у вбудованому браузері. Скопіюйте посилання нижче та відкрийте його в Safari або Chrome — файл завантажиться автоматично."
                  : "File downloads are not supported in the in-app browser. Copy the link below and open it in Safari or Chrome — the file will download automatically."}
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
                onClick={() => setShowWebViewBanner(false)}
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
      )}
    </>
  );
}

// import { useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   useMyList,
//   useProjectMeta,
//   useConfigurationStore,
// } from "../stores/configurationStore";
// import { useTranslation, useLanguage } from "../i18n";
// import { downloadMyListXlsx } from "../utils/generateMyListXlsx";
// import { ExportModal } from "./ExportModal";
// import { toast } from "../utils/toast";

// export function StickyExportBar() {
//   const location = useLocation();
//   const myList = useMyList();
//   const projectMeta = useProjectMeta();
//   const { lang } = useLanguage();
//   const { t } = useTranslation();
//   const clearMyList = useConfigurationStore((s) => s.clearMyList);
//   const setProjectMeta = useConfigurationStore((s) => s.setProjectMeta);

//   const [isExportModalOpen, setIsExportModalOpen] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);

//   if (location.pathname !== "/my-list" || myList.length === 0) return null;

//   const totalUnits = myList.reduce((sum, item) => sum + item.qty, 0);

//   const handleClearAll = () => {
//     toast.confirm(t("myList.clearListConfirm"), () => {
//       clearMyList();
//     });
//   };

//   const handleExport = async (meta: { projectName: string; clientName: string; date: string }) => {
//     setProjectMeta({
//       projectName: meta.projectName,
//       clientName: meta.clientName,
//       date: meta.date,
//     });

//     setIsExportModalOpen(false);
//     setIsDownloading(true);

//     try {
//       const updatedMeta = {
//         ...projectMeta,
//         projectName: meta.projectName,
//         clientName: meta.clientName,
//         date: meta.date,
//       };
//       await downloadMyListXlsx(myList, lang as "en" | "uk", updatedMeta);
//       setProjectMeta({ lastExportedAt: Date.now(), updatedAt: Date.now() });
//     } catch {
//       toast.error(t("toast.errorOccurred"));
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   return (
//     <>
//       <div className="border-t border-slate-200 bg-white">
//         <div className="max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <span className="text-xs font-mono text-slate-500">
//             {t("stickyBar.totalUnits", { count: String(totalUnits) })}
//           </span>

//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={handleClearAll}
//               className="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors"
//             >
//               {t("myList.clearList")}
//             </button>
//             <button
//               type="button"
//               onClick={() => setIsExportModalOpen(true)}
//               disabled={isDownloading}
//               className="px-4 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-sm hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isDownloading ? t("common.loading") : t("myList.downloadList")}
//             </button>
//           </div>
//         </div>
//       </div>

//       <ExportModal
//         isOpen={isExportModalOpen}
//         projectMeta={projectMeta}
//         onClose={() => setIsExportModalOpen(false)}
//         onExport={handleExport}
//       />
//     </>
//   );
// }