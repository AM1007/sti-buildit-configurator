import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface VideoModalProps {
  isOpen: boolean;
  videoId: string;
  title?: string;
  onClose: () => void;
}

export function VideoModal({ isOpen, videoId, title, onClose }: VideoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100">
      <div
        className="fixed inset-0 z-100 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label={title ?? "Video player"}
        className="fixed left-1/2 top-1/2 z-101 w-full max-w-fit -translate-x-1/2 -translate-y-1/2 rounded border-0 bg-white p-2 shadow-md shadow-gray-400 md:p-4 xl:p-5"
      >
        <div className="aspect-video w-[85vw] md:w-160 xl:w-200 2xl:w-240">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title ?? "Video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}