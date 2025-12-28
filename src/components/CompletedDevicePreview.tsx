// ============================================================================
// COMPLETED DEVICE PREVIEW COMPONENT
// ============================================================================
//
// Displays completed device image in Product Preview tab.
//
// Features:
// - Lazy loading: image loads only when component is rendered
// - Error fallback: shows placeholder if image fails to load
// - Responsive: scales appropriately on mobile/tablet/desktop
//
// Usage:
//   <CompletedDevicePreview 
//     imagePath="/path/to/image.webp" 
//     productCode="SS2024NT-EN" 
//   />
//
// ============================================================================

import { useState, useCallback } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface CompletedDevicePreviewProps {
  /** Path to completed device image, or null if not available */
  imagePath: string | null;
  
  /** Product code for alt text */
  productCode: string;
  
  /** Optional reason why image is not available (for debugging) */
  reason?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// ASSUMPTION: Typo "AVALIABLE" preserved from original specification (MD line 272)
const PLACEHOLDER_TEXT = "PRODUCT PREVIEW NOT AVALIABLE";

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays completed device image or placeholder.
 * 
 * States:
 * - imagePath is null → placeholder immediately
 * - imagePath exists → attempt to load image
 * - Image load error → placeholder with fallback
 * 
 * Performance:
 * - Uses loading="lazy" for native lazy loading
 * - Image only loads when component enters viewport
 * - No preloading or eager fetching
 */
export function CompletedDevicePreview({
  imagePath,
  productCode,
  reason,
}: CompletedDevicePreviewProps) {
  // Track if image failed to load
  const [hasError, setHasError] = useState(false);
  
  // Reset error state if imagePath changes
  // This handles case when user changes configuration
  const [prevImagePath, setPrevImagePath] = useState(imagePath);
  if (imagePath !== prevImagePath) {
    setPrevImagePath(imagePath);
    setHasError(false);
  }

  // Handle image load error
  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Render: Placeholder
  // ---------------------------------------------------------------------------
  if (!imagePath || hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 md:py-24 w-full">
        <p className="text-lg md:text-xl font-semibold text-gray-400 uppercase tracking-wide text-center px-4">
          {PLACEHOLDER_TEXT}
        </p>
        
        {/* Debug info in development */}
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

  // ---------------------------------------------------------------------------
  // Render: Image
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 w-full">
      {/* Image container with max dimensions */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl px-4">
        <img
          src={imagePath}
          alt={`Completed device: ${productCode}`}
          loading="lazy"
          onError={handleError}
          className="w-full h-auto object-contain"
        />
      </div>
      
      {/* Product code caption */}
      <p className="mt-4 text-sm font-mono font-semibold text-gray-600 text-center">
        {productCode}
      </p>
    </div>
  );
}