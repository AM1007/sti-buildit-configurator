// ============================================================================
// BUILD IT CALCULATOR - MAIN CONTAINER COMPONENT
// ============================================================================
//
// Root component that orchestrates the entire configurator:
// - Receives model definition as prop
// - Manages configuration state via useConfiguration hook
// - Generates product model via buildProductModel utility
// - Renders Sidebar (left) and MainPanel (right)
//
// Interaction:
// - Click preview tile → opens corresponding step in sidebar
// - Click option → selects/deselects option
// - Click accordion header → toggles accordion
//
// Responsive:
// - Desktop: Two-column layout (sidebar + main)
// - Mobile: Stacked layout with collapsible sidebar
//
// ============================================================================

import { useState } from "react";
import type { ModelDefinition } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";

// ============================================================================
// TYPES
// ============================================================================

interface BuildItCalculatorProps {
  /** Model definition to configure */
  model: ModelDefinition;

  /** Callback when configuration is added to My List */
  onAddToMyList?: (productCode: string) => void;

  /** Callback to go back to model selection */
  onBack?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Main calculator component.
 *
 * Responsibilities:
 * - State management (configuration, current step)
 * - Product model generation
 * - Layout orchestration (sidebar + main panel)
 * - Responsive behavior
 */
export function BuildItCalculator({
  model,
  onAddToMyList,
  onBack,
}: BuildItCalculatorProps) {
  // Mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Configuration state and controls
  const {
    config,
    currentStep,
    selectOption,
    clearSelection,
    resetConfiguration,
    setCurrentStep,
    isComplete,
  } = useConfiguration(model);

  // Generate product model from current configuration
  const productModel = buildProductModel(config, model);

  // Handle add to My List
  const handleAddToMyList = () => {
    if (productModel.isComplete && onAddToMyList) {
      onAddToMyList(productModel.fullCode);
    }
  };

  // Handle edit step from preview tile click
  const handleEditStep = (stepId: string) => {
    setCurrentStep(stepId);
    // On mobile, open sidebar when editing
    setSidebarOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Mobile Header */}
      <div className="md:hidden bg-red-700 text-white p-4 flex items-center justify-between">
        {/* Back button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-red-600 rounded"
            aria-label="Back to model selection"
          >
            <BackIcon />
          </button>
        )}

        {/* Title */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold">
            Build <span className="bg-white text-black px-1">it</span>
          </h1>
          <p className="text-xs text-red-200 truncate">{model.name}</p>
        </div>

        {/* Menu toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-red-600 rounded"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Left Panel - Sidebar */}
      {/* Desktop: always visible, Mobile: toggleable */}
      <div
        className={`
          ${sidebarOpen ? "block" : "hidden"} md:block
          w-full md:w-96 shrink-0
          ${sidebarOpen ? "absolute inset-0 z-20 md:relative" : ""}
        `}
      >
        <Sidebar
          model={model}
          config={config}
          currentStep={currentStep}
          onSelectOption={(stepId, optionId) => {
            selectOption(stepId, optionId);
            // Close sidebar on mobile after selection
            setSidebarOpen(false);
          }}
          onClearOption={(stepId) => {
            clearSelection(stepId);
          }}
          onSetCurrentStep={setCurrentStep}
          className="h-full"
        />
      </div>

      {/* Right Panel - Preview & Actions */}
      <MainPanel
        model={model}
        config={config}
        productModel={productModel}
        onReset={resetConfiguration}
        onAddToMyList={handleAddToMyList}
        onEditStep={handleEditStep}
        className="flex-1"
      />

      {/* Completion indicator (mobile) */}
      {isComplete && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-10">
          <div className="bg-green-600 text-white text-center py-3 px-4 rounded-lg shadow-lg">
            <p className="font-medium">Configuration complete!</p>
            <p className="text-sm text-green-100">{productModel.fullCode}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}