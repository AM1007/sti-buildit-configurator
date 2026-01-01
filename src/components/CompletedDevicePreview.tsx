import { useState, useCallback } from "react";

interface CompletedDevicePreviewProps {
  imagePath: string | null;
  productCode: string;
  reason?: string;
}

const PLACEHOLDER_TEXT = "PRODUCT PREVIEW NOT AVALIABLE";

export function CompletedDevicePreview({
  imagePath,
  productCode,
  reason,
}: CompletedDevicePreviewProps) {
  const [hasError, setHasError] = useState(false);

  const [prevImagePath, setPrevImagePath] = useState(imagePath);
  if (imagePath !== prevImagePath) {
    setPrevImagePath(imagePath);
    setHasError(false);
  }

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (!imagePath || hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 md:py-24 w-full">
        <p className="text-lg md:text-xl font-semibold text-gray-400 uppercase tracking-wide text-center px-4">
          {PLACEHOLDER_TEXT}
        </p>
        
        {reason && import.meta.env.DEV && (
          <p className="text-xs text-gray-300 mt-2 text-center px-4">
            Reason: {reason}
          </p>
        )}
        
        {hasError && import.meta.env.DEV && (
          <p className="text-xs text-red-300 mt-1 text-center px-4">
            Failed to load: {imagePath}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 w-full">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl px-4">
        <img
          src={imagePath}
          alt={`Completed device: ${productCode}`}
          loading="lazy"
          onError={handleError}
          className="w-full h-auto object-contain"
        />
      </div>
      
      <p className="mt-4 text-sm font-mono font-semibold text-gray-600 text-center">
        {productCode}
      </p>
    </div>
  );
}