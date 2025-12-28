// ============================================================================
// MAIN PANEL COMPONENT
// ============================================================================
//
// Right panel of the configurator containing:
// - Tab switcher (Edit Selections / Product Preview)
// - Product Preview (tiles showing selections)
// - Product Model Display (article code visualization)
// - Action Buttons (shown when configuration is complete)
//
// Interaction:
// - Click on preview tile Ã¢â€ â€™ opens corresponding step in sidebar
//
// Responsive:
// - Desktop: Fills remaining space next to sidebar
// - Mobile: Full width below header
//
// ============================================================================

import { useState } from "react";
import type { Configuration, ProductModel, ModelDefinition, StepId } from "../types";
import { ProductPreview } from "./ProductPreview";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { ActionButtons } from "./ActionButtons";
import { CompletedDevicePreview } from "./CompletedDevicePreview";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";

// ============================================================================
// CONSTANTS
// ============================================================================

type TabId = "edit" | "preview";

// ASSUMPTION: Typo "AVALIABLE" preserved from MD specification (line 272)

// ============================================================================
// TYPES
// ============================================================================

interface MainPanelProps {
  /** Current model definition */
  model: ModelDefinition;

  /** Current configuration state */
  config: Configuration;

  /** Generated product model */
  productModel: ProductModel;

  /** Callback to reset configuration */
  onReset: () => void;

  /** Callback to add to My List */
  onAddToMyList: () => void;

  /** Callback when user clicks tile to edit step */
  onEditStep: (stepId: StepId) => void;

  /** Optional: additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Right panel with product preview, model display, and actions.
 *
 * Layout:
 * - Flexible width (fills remaining space)
 * - Grey background
 * - Scrollable content
 * - Centered content with max-width
 *
 * Interaction:
 * - Click preview tile Ã¢â€ â€™ onEditStep Ã¢â€ â€™ opens step in sidebar
 */
export function MainPanel({
  model,
  config,
  productModel,
  onReset,
  onAddToMyList,
  onEditStep,
  className = "",
}: MainPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("edit");

  return (
    <main className={`flex-1 bg-gray-100 overflow-y-auto ${className}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Tabs: Edit Selections / Product Preview */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <TabButton 
            active={activeTab === "edit"} 
            onClick={() => setActiveTab("edit")}
          >
            Edit Selections
          </TabButton>
          <TabButton 
            active={activeTab === "preview"} 
            onClick={() => setActiveTab("preview")}
          >
            Product Preview
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === "edit" ? (
          <>
            {/* Product Preview Grid (Edit mode - shows tiles) */}
            <ProductPreview 
              model={model} 
              config={config} 
              onEditStep={onEditStep}
            />

            {/* Product Model Code Display */}
            <ProductModelDisplay model={model} productModel={productModel} />

            {/* Action Buttons - only shown when configuration is complete */}
            {productModel.isComplete && (
              <ActionButtons
                productModel={productModel}
                onReset={onReset}
                onAddToMyList={onAddToMyList}
              />
            )}

            {/* Incomplete configuration hint */}
            {!productModel.isComplete && productModel.missingSteps && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Complete all required selections to see action buttons.
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Missing:{" "}
                  {productModel.missingSteps
                    .map((stepId) => {
                      const step = model.steps.find((s) => s.id === stepId);
                      return step?.title ?? stepId;
                    })
                    .join(", ")}
                </p>
              </div>
            )}
          </>
        ) : (
          /* Product Preview Tab */
          <ProductPreviewTab
            model={model}
            config={config}
            productModel={productModel}
            onReset={onReset}
            onAddToMyList={onAddToMyList}
          />
        )}
      </div>
    </main>
  );
}

// ============================================================================
// PRODUCT PREVIEW TAB (internal component)
// ============================================================================

interface ProductPreviewTabProps {
  /** Current model definition */
  model: ModelDefinition;
  
  /** Current configuration state */
  config: Configuration;
  
  /** Generated product model */
  productModel: ProductModel;
  
  /** Callback to reset configuration */
  onReset: () => void;
  
  /** Callback to add to My List */
  onAddToMyList: () => void;
}

/**
 * Content for Product Preview tab.
 * 
 * Shows completed device image if available, otherwise placeholder.
 * Image availability depends on:
 * - Model: currently only stopper-stations
 * - Colour: currently only RED (colour = "0")
 * - Language: ZL variants have no images
 * 
 * Action buttons shown only when configuration is complete.
 */
function ProductPreviewTab({ 
  model,
  config,
  productModel, 
  onReset, 
  onAddToMyList 
}: ProductPreviewTabProps) {
  // Determine image path using utility function
  const { imagePath, reason } = getCompletedDeviceImage({
    fullCode: productModel.fullCode,
    modelId: model.id,
    config,
    isComplete: productModel.isComplete,
  });

  return (
    <div className="flex flex-col items-center">
      {/* Completed Device Image or Placeholder */}
      <CompletedDevicePreview
        imagePath={imagePath}
        productCode={productModel.fullCode}
        reason={reason}
      />

      {/* Action Buttons - only when configuration is complete */}
      {productModel.isComplete && (
        <ActionButtons
          productModel={productModel}
          onReset={onReset}
          onAddToMyList={onAddToMyList}
        />
      )}
    </div>
  );
}

// ============================================================================
// TAB BUTTON (internal component)
// ============================================================================

interface TabButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}

/**
 * Tab button for Edit Selections / Product Preview toggle.
 * TODO: Implement actual tab switching when Product Preview images are ready.
 */
function TabButton({ children, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      className={`
        pb-2 px-1 text-sm font-medium transition-colors
        ${
          active
            ? "text-red-600 border-b-2 border-red-600"
            : "text-gray-500 hover:text-gray-700"
        }
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
