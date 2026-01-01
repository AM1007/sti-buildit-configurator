import { useState } from "react";
import type { ProductModel } from "../types";
import { ShareMenu } from "./ShareMenu";

interface ActionButtonsProps {
  productModel: ProductModel;
  onReset: () => void;
  onAddToMyList: () => void;
  isInMyList?: boolean;
}

export function ActionButtons({
  productModel,
  onReset,
  onAddToMyList,
  isInMyList = false,
}: ActionButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleWhereToBuy = () => {
    window.open("https://example.com/where-to-buy", "_blank");
  };

  return (
    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
      <button
        type="button"
        onClick={onReset}
        className="px-3 md:px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 
                   transition-colors text-sm font-medium flex items-center gap-2"
      >
        <RefreshIcon />
        <span>Start over</span>
      </button>

      <button
        type="button"
        onClick={handleWhereToBuy}
        className="px-3 md:px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 
                   transition-colors text-sm font-medium"
      >
        Where to Buy
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowShareMenu((prev) => !prev)}
          className="px-3 md:px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 
                     transition-colors text-sm font-medium flex items-center gap-2"
          aria-expanded={showShareMenu}
          aria-haspopup="true"
        >
          <span>Share</span>
          <ShareIcon />
        </button>

        {showShareMenu && (
          <ShareMenu
            productModel={productModel}
            onClose={() => setShowShareMenu(false)}
          />
        )}
      </div>

      <button
        type="button"
        onClick={onAddToMyList}
        className={`
          w-10 h-10 rounded flex items-center justify-center text-xl
          transition-colors border-2
          ${
            isInMyList
              ? "bg-red-600 border-red-600 text-white cursor-default"
              : "bg-white border-red-600 text-red-600 hover:bg-red-50"
          }
        `}
        aria-label={isInMyList ? "Already in My List" : "Add to My List"}
        aria-pressed={isInMyList}
        disabled={isInMyList}
        title={isInMyList ? "Already in My List" : "Add to My List"}
      >
        {isInMyList ? "★" : "☆"}
      </button>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}