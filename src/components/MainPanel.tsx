import { useState } from "react";
import type { Configuration, ProductModel, ModelDefinition, StepId } from "../types";
import { ProductPreview } from "./ProductPreview";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { ActionButtons } from "./ActionButtons";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";

type TabId = "edit" | "preview";

interface MainPanelProps {
  model: ModelDefinition;
  config: Configuration;
  productModel: ProductModel;
  onEditStep: (stepId: StepId) => void;
  onReset: () => void;
  onAddToMyList: () => void;
  isInMyList?: boolean;
  className?: string;
}

export function MainPanel({
  model,
  config,
  productModel,
  onEditStep,
  onReset,
  onAddToMyList,
  isInMyList = false,
  className = "",
}: MainPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("edit");

  const { imagePath, reason } = getCompletedDeviceImage({
    fullCode: productModel.fullCode,
    modelId: model.id,
    config,
    isComplete: productModel.isComplete,
  });

  return (
    <div className={`hidden h-full w-full lg:block ${className}`}>
      <div className="sticky top-0 flex h-fit flex-col gap-16 p-5 lg:p-10 xl:gap-20 xl:p-16">
        <div className="min-h-144 w-full">
          <div className="inline-flex items-center justify-center h-auto gap-6 rounded-none bg-white p-0 text-black xl:gap-10">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`
                inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5
                text-sm font-medium transition-all focus-visible:outline-none
                rounded-none bg-white p-0 shadow-none outline-0 ring-0
                ${activeTab === "edit" ? "text-red-600" : "text-black"}
              `}
            >
              <span className="font-bold text-sm lg:text-lg">Edit Selections</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`
                inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5
                text-sm font-medium transition-all focus-visible:outline-none
                rounded-none bg-white p-0 shadow-none outline-0 ring-0
                ${activeTab === "preview" ? "text-red-600" : "text-black"}
              `}
            >
              <span className="font-bold text-sm lg:text-lg">Product Preview</span>
            </button>
          </div>

          {activeTab === "edit" && (
            <div className="mt-10">
              <ProductPreview
                model={model}
                config={config}
                onEditStep={onEditStep}
              />
            </div>
          )}

          {activeTab === "preview" && (
            <div className="mt-10">
              {imagePath ? (
                <ProductPreviewContent
                  imagePath={imagePath}
                  productCode={productModel.fullCode}
                  isComplete={productModel.isComplete}
                  productModel={productModel}
                  onReset={onReset}
                  onAddToMyList={onAddToMyList}
                  isInMyList={isInMyList}
                />
              ) : (
                <div className="flex w-full flex-col items-center gap-11 py-16 text-center text-gray-500">
                  <p className="font-medium text-base lg:text-md">
                    PREVIEW<br />NOT AVAILABLE
                  </p>
                  <p className="font-normal text-base lg:text-md">
                    {reason || "Please complete build it selections"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <ProductModelDisplay
          model={model}
          productModel={productModel}
          onEditStep={onEditStep}
        />

        {productModel.isComplete && activeTab === "edit" && (
          <ActionButtons
            productModel={productModel}
            onReset={onReset}
            onAddToMyList={onAddToMyList}
            isInMyList={isInMyList}
          />
        )}
      </div>
    </div>
  );
}

interface ProductPreviewContentProps {
  imagePath: string;
  productCode: string;
  isComplete: boolean;
  productModel: ProductModel;
  onReset: () => void;
  onAddToMyList: () => void;
  isInMyList: boolean;
}

function ProductPreviewContent({
  imagePath,
  productCode,
  isComplete,
  productModel,
  onReset,
  onAddToMyList,
  isInMyList,
}: ProductPreviewContentProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex w-full flex-col items-center gap-11 py-16 text-center text-gray-500">
        <p className="font-medium text-base lg:text-md">
          PREVIEW<br />NOT AVAILABLE
        </p>
        <p className="font-normal text-base lg:text-md">
          Image failed to load
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-10 py-5">
      <div className="mx-auto max-w-120 flex-1">
        <img
          alt={`Image of ${productCode}`}
          loading="lazy"
          width="600"
          height="600"
          className="select-none object-contain w-full h-auto"
          src={imagePath}
          onError={() => setHasError(true)}
        />
      </div>

      {isComplete && (
        <div className="flex w-full flex-wrap items-center justify-center gap-2 md:items-start md:gap-6">
          <ActionButtons
            productModel={productModel}
            onReset={onReset}
            onAddToMyList={onAddToMyList}
            isInMyList={isInMyList}
          />
        </div>
      )}
    </div>
  );
}