import { Link } from "react-router-dom";
import type { SavedConfiguration } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelById } from "../data/models";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";

interface ProductCardProps {
  item: SavedConfiguration;
  onRemove: (id: string) => void;
}

export function ProductCard({ item, onRemove }: ProductCardProps) {
  const model = getModelById(item.modelId);
  const modelName = MODEL_NAMES[item.modelId] ?? item.modelId;

  const { imagePath } = getCompletedDeviceImage({
    fullCode: item.productCode,
    modelId: item.modelId,
    config: item.configuration,
    isComplete: true,
  });

  const configuratorUrl = model
    ? `/?model=${model.slug}&productModel=${encodeURIComponent(item.productCode)}#build-it`
    : "/";

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.id);
  };

  return (
    <Link
      to={configuratorUrl}
      aria-label={item.productCode}
      className="block"
    >
      <article className="group/primary-card flex h-full flex-col justify-between bg-white transition-all duration-300 hover:drop-shadow-xl">
        <div className="relative flex-1 border-2 border-b-0 border-solid border-gray-200 transition-all group-hover/primary-card:border-transparent">
          <div className="absolute right-1 -top-0.5 z-20">
            <div className="flex gap-1">
              <span className="text-xs mt-2.5 font-medium text-gray-400">EMEA</span>
              <div className="relative">
                <span className="inline-grid text-3xl transition-all duration-300 ease-in-out text-gray-300">
                  <BookmarkIcon />
                </span>
                <div>
                  <button
                    type="button"
                    onClick={handleRemoveClick}
                    className="absolute right-3 top-2 flex w-[38%] items-center justify-center cursor-pointer"
                    aria-label="Remove from my list"
                  >
                    <span className="inline-grid text-base text-red-600">
                      <StarFilledIcon />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-auto w-full px-11 py-8 lg:px-12">
            <div className="bg-gray-50 relative overflow-hidden rounded-2xl pb-[100%]">
              <div className="absolute inset-0">
                {imagePath ? (
                  <img
                    alt={item.productCode}
                    loading="lazy"
                    decoding="async"
                    className="object-contain absolute h-full w-full inset-0"
                    src={imagePath}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-sm text-center px-4">No preview</span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 -left-0.5 block bg-gray-700/85 py-0.5 pl-5 pr-2 text-white">
              <span className="font-normal text-xs">Custom built product</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-4 lg:py-4">
            <h3 className="font-bold text-lg lg:text-xl flex min-h-11 w-full items-center text-black lg:min-h-17">
              <span className="line-clamp-2 w-full text-left">{item.productCode}</span>
            </h3>
            <span className="font-normal text-xs lg:text-base line-clamp-2 min-h-12 text-left text-gray-500">
              {modelName}
            </span>
          </div>
        </div>

        <span className="cursor-pointer inline-flex items-center justify-center relative ring-offset-0 transition-all duration-300 ease-in-out focus-visible:outline-none box-border font-bold text-base gap-1.5 px-5 py-1 min-h-10 border-4 lg:gap-2.5 lg:px-7 lg:py-3 lg:min-h-14 lg:text-lg bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 w-full">
          View Details
          <span className="inline-grid leading-none text-inherit">
            <ArrowRightIcon />
          </span>
        </span>
      </article>
    </Link>
  );
}

function BookmarkIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 30 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.5577 0H0.325652C-0.815808 0 1.41008 0.921321 1.41008 2.06278V29.1806C1.41008 30.1182 1.86666 30.9906 2.63307 31.5287L14.1129 39.5597C14.9527 40.1468 16.0778 40.1468 16.9176 39.5597L28.3974 31.5287C29.1638 30.9906 29.6204 30.1182 29.6204 29.1806V2.06278C29.6204 0.921321 28.6991 0 27.5577 0ZM24.174 15.4831L20.2523 18.8178L21.4753 23.832C21.7036 24.7778 20.6844 25.5279 19.861 25.0143L15.5153 22.2829L11.1614 25.0061C10.3379 25.5198 9.31876 24.7697 9.54705 23.8239L10.77 18.8096L6.84831 15.4749C6.11452 14.8471 6.49772 13.6323 7.46796 13.5671L12.5801 13.192L14.5124 8.40603C14.8793 7.50917 16.1431 7.50917 16.51 8.40603L18.4423 13.192L23.5544 13.5671C24.5246 13.6404 24.916 14.8553 24.174 15.4831Z" />
      <path d="M20.2523 18.8178L24.174 15.4831C24.916 14.8553 24.5246 13.6404 23.5544 13.5671L18.4423 13.192L16.51 8.40603C16.1431 7.50917 14.8793 7.50917 14.5124 8.40603L12.5801 13.192L7.46796 13.5671C6.49772 13.6323 6.11452 14.8471 6.84831 15.4749L10.77 18.8096L9.54705 23.8239C9.31876 24.7697 10.3379 25.5198 11.1614 25.0061L15.5153 22.2829L19.861 25.0143C20.6844 25.5279 21.7036 24.7778 21.4753 23.832L20.2523 18.8178Z" />
    </svg>
  );
}

function StarFilledIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.6931 6.4241C17.577 6.06489 17.2584 5.80977 16.8814 5.7758L11.7614 5.31089L9.73677 0.572098C9.58749 0.224806 9.2475 0 8.86976 0C8.49201 0 8.15203 0.224806 8.00274 0.572911L5.97814 5.31089L0.857266 5.7758C0.48101 5.81058 0.163222 6.06489 0.0464207 6.4241C-0.070381 6.7833 0.037488 7.17728 0.322116 7.42564L4.19227 10.8198L3.05105 15.8469C2.96755 16.2165 3.11101 16.5986 3.4177 16.8203C3.58255 16.9394 3.77541 17 3.9699 17C4.13759 17 4.30393 16.9548 4.45322 16.8655L8.86976 14.2259L13.2847 16.8655C13.6077 17.0598 14.015 17.0421 14.321 16.8203C14.6278 16.5979 14.7712 16.2157 14.6876 15.8469L13.5464 10.8198L17.4166 7.42632C17.7012 7.17728 17.8099 6.78398 17.6931 6.4241Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13L5 11ZM19.7071 12.7071C20.0976 12.3166 20.0976 11.6834 19.7071 11.2929L13.3431 4.92893C12.9526 4.53841 12.3195 4.53841 11.9289 4.92893C11.5384 5.31946 11.5384 5.95262 11.9289 6.34315L17.5858 12L11.9289 17.6569C11.5384 18.0474 11.5384 18.6805 11.9289 19.0711C12.3195 19.4616 12.9526 19.4616 13.3431 19.0711L19.7071 12.7071ZM5 13L19 13L19 11L5 11L5 13Z"
        fill="currentColor"
      />
    </svg>
  );
}