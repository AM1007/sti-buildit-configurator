import type { CustomTextData } from "../types";

interface CustomTextDisplayProps {
  customText: CustomTextData;
}

export function CustomTextDisplay({ customText }: CustomTextDisplayProps) {
  const hasCoverData = customText.coverLine1 || customText.coverLine2 || customText.coverLine3;

  return (
    <div className="mt-2 border-2 border-black bg-white p-4 lg:p-5">
      <h4 className="mb-2 text-lg font-bold text-black lg:text-2xl">Custom Text</h4>
      <p className="text-base font-normal text-brand-600 lg:text-lg">
        NON-RETURNABLE
      </p>

      <div className="ml-4 mt-3 lg:ml-6 lg:mt-4">
        <ul className="grid gap-4">
          {/* Label Block */}
          <li>
            <div>
              <div className="relative mb-1">
                <span className="absolute left-0 top-1/2 inline-block h-2 w-2 -translate-y-1/2 rounded-full bg-brand-600" />
                <span className="ml-4 text-sm font-bold text-black lg:text-base">Label</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <span className="inline-block text-sm font-normal text-black">
                  Line 1: {customText.line1}
                </span>
                {customText.lineCount >= 2 && customText.line2 && (
                  <span className="inline-block text-sm font-normal text-black">
                    Line 2: {customText.line2}
                  </span>
                )}
                {customText.lineCount >= 3 && customText.line3 && (
                  <span className="inline-block text-sm font-normal text-black">
                    Line 3: {customText.line3}
                  </span>
                )}
              </div>
            </div>
          </li>

          {/* Cover Block (only if cover data exists) */}
          {hasCoverData && (
            <li>
              <div>
                <div className="relative mb-1">
                  <span className="absolute left-0 top-1/2 inline-block h-2 w-2 -translate-y-1/2 rounded-full bg-brand-600" />
                  <span className="ml-4 text-sm font-bold text-black lg:text-base">Cover</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {customText.coverLine1 && (
                    <span className="inline-block text-sm font-normal text-black">
                      Line 1: {customText.coverLine1}
                    </span>
                  )}
                  {customText.coverLineCount && customText.coverLineCount >= 2 && customText.coverLine2 && (
                    <span className="inline-block text-sm font-normal text-black">
                      Line 2: {customText.coverLine2}
                    </span>
                  )}
                  {customText.coverLineCount && customText.coverLineCount >= 3 && customText.coverLine3 && (
                    <span className="inline-block text-sm font-normal text-black">
                      Line 3: {customText.coverLine3}
                    </span>
                  )}
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}