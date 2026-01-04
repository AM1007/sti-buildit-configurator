import { useState } from "react";
import type { ProductModel } from "../types";
import { ShareMenu } from "./ShareMenu";

interface ActionButtonsProps {
  productModel: ProductModel;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  isInMyList?: boolean;
}

export function ActionButtons({
  productModel,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList = false,
}: ActionButtonsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleWhereToBuy = () => {
    window.open("https://example.com/where-to-buy", "_blank");
  };

  const handleStarClick = () => {
    if (isInMyList) {
      onRemoveFromMyList();
    } else {
      onAddToMyList();
    }
  };

  const starTitle = isInMyList ? "Remove from My List" : "Add to My List";

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2 md:items-start md:gap-6">
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer inline-flex items-center justify-center gap-1 border-4 border-gray-500 bg-gray-500 px-4.5 py-0.5 text-sm font-bold text-white transition-all duration-300 hover:border-gray-600 hover:bg-gray-600 lg:gap-1.5 lg:px-6 lg:py-1 lg:text-base min-h-9 lg:min-h-11"
      >
        <span className="inline-grid text-lg leading-none">
          <RefreshIcon />
        </span>
        <span>Start over</span>
      </button>

      <a
        href="https://example.com/where-to-buy"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.preventDefault();
          handleWhereToBuy();
        }}
        className="cursor-pointer inline-flex items-center justify-center gap-1 border-4 border-brand-600 bg-brand-600 px-4.5 py-0.5 text-sm font-bold text-white transition-all duration-300 hover:border-brand-700 hover:bg-brand-700 lg:gap-1.5 lg:px-6 lg:py-1 lg:text-base min-h-9 lg:min-h-11 whitespace-nowrap"
      >
        Where to Buy
      </a>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowShareMenu((prev) => !prev)}
          className="cursor-pointer inline-flex items-center justify-center gap-1 border-4 border-gray-500 bg-gray-500 px-4.5 py-0.5 text-sm font-bold text-white transition-all duration-300 hover:border-gray-600 hover:bg-gray-600 lg:gap-1.5 lg:px-6 lg:py-1 lg:text-base min-h-9 lg:min-h-11"
          aria-expanded={showShareMenu}
          aria-haspopup="true"
        >
          <span>Share</span>
          <span className="inline-grid text-lg leading-none">
            <ShareIcon />
          </span>
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
        onClick={handleStarClick}
        className="cursor-pointer inline-flex h-9 w-9 items-center justify-center bg-gray-100 transition-all duration-300 lg:h-11 lg:w-11 hover:bg-gray-200"
        aria-label={starTitle}
        aria-pressed={isInMyList}
        title={starTitle}
      >
        <div className="flex items-center justify-start gap-3">
          <span className="inline-grid text-lg text-brand-600">
            {isInMyList ? <StarFilledIcon /> : <StarOutlineIcon />}
          </span>
        </div>
      </button>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.5479 7.7193H4.81983C4.37246 7.7193 4.07422 7.42105 4.07422 6.97368V3.24561C4.07422 2.79825 4.37246 2.5 4.81983 2.5C5.2672 2.5 5.56545 2.79825 5.56545 3.24561V6.22807H8.5479C8.99527 6.22807 9.29352 6.52631 9.29352 6.97368C9.29352 7.42105 8.99527 7.7193 8.5479 7.7193Z"
        fill="currentColor"
      />
      <path
        d="M10.0386 16.6668C9.21841 16.6668 8.39823 16.5177 7.65262 16.2195C6.31051 15.6975 5.19209 14.8028 4.37192 13.6098C4.14823 13.237 4.22279 12.7896 4.5956 12.5659C4.96841 12.3423 5.41578 12.4168 5.63946 12.7896C6.23595 13.6844 7.13069 14.43 8.17455 14.8028C9.21841 15.1756 10.3368 15.2502 11.4552 14.9519C12.4991 14.6537 13.4684 13.9826 14.1395 13.0879C14.8105 12.1931 15.1833 11.1493 15.2579 10.0309C15.2579 8.91244 14.9596 7.79402 14.2886 6.89928C13.6175 6.00455 12.7228 5.3335 11.6789 4.96069C10.6351 4.58788 9.51665 4.58788 8.39823 4.96069C7.35437 5.3335 6.45964 6.00455 5.78858 6.89928C5.5649 7.27209 5.11753 7.34665 4.74472 7.12297C4.37192 6.89928 4.29735 6.37735 4.5956 6.07911C5.41578 4.88613 6.60876 3.99139 7.95086 3.54402C9.29297 3.09665 10.7842 3.09665 12.1263 3.54402C13.4684 3.99139 14.6614 4.88613 15.4816 6.07911C16.3017 7.27209 16.7491 8.6142 16.6745 10.1054C16.6745 11.5221 16.1526 12.9388 15.2579 14.0572C14.3631 15.1756 13.1702 15.9958 11.7535 16.4431C11.3061 16.5923 10.6351 16.6668 10.0386 16.6668Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M35.4167 39.9999H4.58357C2.05522 39.9999 0.000488281 37.9449 0.000488281 35.4168V11.2502C0.000488281 8.72184 2.05522 6.66711 4.58357 6.66711H10.417C11.1069 6.66711 11.6669 7.2271 11.6669 7.9171C11.6669 8.60709 11.1069 9.16709 10.417 9.16709H4.58357C3.43521 9.16709 2.50046 10.1018 2.50046 11.2502V35.4168C2.50046 36.5649 3.43521 37.4999 4.58357 37.4999H35.4167C36.5651 37.4999 37.5001 36.5649 37.5001 35.4168V21.2501C37.5001 20.5601 38.0601 20.0001 38.7501 20.0001C39.4401 20.0001 40.0001 20.5601 40.0001 21.2501V35.4168C40.0001 37.9449 37.9451 39.9999 35.4167 39.9999Z"
        fill="currentColor"
      />
      <path
        d="M11.2485 26.6452C11.157 26.6452 11.0651 26.6352 10.9736 26.6117C10.4087 26.4801 10.0004 25.9968 10.0004 25.4169V22.917C10.0004 13.9571 17.2904 6.66711 26.2502 6.66711H26.6668V1.25029C26.6668 0.740351 26.9768 0.281982 27.4502 0.0903332C27.9217 -0.0994842 28.4633 0.0152606 28.8167 0.383604L39.6501 11.6335C40.1167 12.1169 40.1167 12.8835 39.6501 13.3669L28.8167 24.6168C28.4633 24.9851 27.9183 25.0986 27.4502 24.91C26.9768 24.7184 26.6668 24.26 26.6668 23.7501V18.3336H24.6868C19.4437 18.3336 14.7318 21.2467 12.3887 25.9351C12.1735 26.3685 11.7219 26.6452 11.2485 26.6452ZM26.2502 9.16709C19.2502 9.16709 13.4537 14.4252 12.6053 21.2C15.6351 17.8203 19.9801 15.8336 24.6868 15.8336H27.9168C28.6068 15.8336 29.1668 16.3936 29.1668 17.0836V20.6501L37.0149 12.5002L29.1668 4.35024V7.9171C29.1668 8.60709 28.6068 9.16709 27.9168 9.16709H26.2502Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarOutlineIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.97044 17C3.77609 17 3.58309 16.9394 3.41837 16.8203C3.11155 16.5979 2.96822 16.2157 3.05173 15.8469L4.19295 10.8198L0.322652 7.42564C0.0381597 7.17728 -0.0705214 6.78398 0.0462803 6.4241C0.163082 6.06489 0.480869 5.81058 0.857125 5.7758L5.978 5.31089L8.0026 0.572911C8.15189 0.224806 8.49187 0 8.86962 0C9.24736 0 9.58735 0.224806 9.73663 0.572098L11.7612 5.31089L16.8813 5.7758C17.2584 5.80977 17.5762 6.06489 17.693 6.4241C17.8098 6.7833 17.7017 7.17728 17.4173 7.42564L13.547 10.8191L14.6882 15.8461C14.7718 16.2157 14.6284 16.5979 14.3217 16.8196C14.0157 17.0413 13.6076 17.0583 13.2853 16.8647L8.86962 14.2259L4.45389 16.8661C4.3046 16.9548 4.13827 17 3.97044 17ZM8.86962 13.0891C9.03744 13.0891 9.20365 13.1342 9.35307 13.2228L13.5204 15.7153L12.4434 10.9706C12.3665 10.6329 12.4811 10.2803 12.7421 10.0519L16.3965 6.84691L11.5616 6.40786C11.2135 6.37605 10.9141 6.1572 10.7781 5.83643L8.86962 1.36521L6.95883 5.83711C6.8243 6.15571 6.52492 6.37456 6.17763 6.40637L1.34206 6.84542L4.99635 10.0504C5.2581 10.2795 5.3726 10.6314 5.29505 10.9699L4.2188 15.7145L8.38617 13.2228C8.53545 13.1342 8.70179 13.0891 8.86962 13.0891ZM5.93888 5.40252L5.93807 5.40401L5.93888 5.40252ZM11.7989 5.40036L11.7997 5.40184L11.7989 5.40036Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarFilledIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.6931 6.4241C17.577 6.06489 17.2584 5.80977 16.8814 5.7758L11.7614 5.31089L9.73677 0.572098C9.58749 0.224806 9.2475 0 8.86976 0C8.49201 0 8.15203 0.224806 8.00274 0.572911L5.97814 5.31089L0.857266 5.7758C0.48101 5.81058 0.163222 6.06489 0.0464207 6.4241C-0.070381 6.7833 0.037488 7.17728 0.322116 7.42564L4.19227 10.8198L3.05105 15.8469C2.96755 16.2165 3.11101 16.5986 3.4177 16.8203C3.58255 16.9394 3.77541 17 3.9699 17C4.13759 17 4.30393 16.9548 4.45322 16.8655L8.86976 14.2259L13.2847 16.8655C13.6077 17.0598 14.015 17.0421 14.321 16.8203C14.6278 16.5979 14.7712 16.2157 14.6876 15.8469L13.5464 10.8198L17.4166 7.42632C17.7012 7.17728 17.8099 6.78398 17.6931 6.4241Z"
        fill="currentColor"
      />
    </svg>
  );
}