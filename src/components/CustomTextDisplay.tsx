import type { CustomTextData } from "../types";
import { useTranslation } from "../i18n";

interface CustomTextDisplayProps {
  customText: CustomTextData;
}

export function CustomTextDisplay({ customText }: CustomTextDisplayProps) {
  const { t } = useTranslation();
  const hasCoverData = customText.coverLine1 || customText.coverLine2 || customText.coverLine3;

  return (
    <div className="mt-2 border-2 border-black bg-white p-4 lg:p-5">
      <h4 className="mb-2 text-lg font-bold text-black lg:text-2xl">{t("customTextDisplay.title")}</h4>
      <p className="text-base font-normal text-brand-600 lg:text-lg">
        {t("customTextDisplay.nonReturnable")}
      </p>

      <div className="ml-4 mt-3 lg:ml-6 lg:mt-4">
        <ul className="grid gap-4">
          <li>
            <div>
              <div className="relative mb-1">
                <span className="absolute left-0 top-1/2 inline-block h-2 w-2 -translate-y-1/2 rounded-full bg-brand-600" />
                <span className="ml-4 text-sm font-bold text-black lg:text-base">{t("customText.label")}</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <span className="inline-block text-sm font-normal text-black">
                  {t("customTextDisplay.line", { num: "1" })}: {customText.line1}
                </span>
                {customText.lineCount >= 2 && customText.line2 && (
                  <span className="inline-block text-sm font-normal text-black">
                    {t("customTextDisplay.line", { num: "2" })}: {customText.line2}
                  </span>
                )}
                {customText.lineCount >= 3 && customText.line3 && (
                  <span className="inline-block text-sm font-normal text-black">
                    {t("customTextDisplay.line", { num: "3" })}: {customText.line3}
                  </span>
                )}
              </div>
            </div>
          </li>

          {hasCoverData && (
            <li>
              <div>
                <div className="relative mb-1">
                  <span className="absolute left-0 top-1/2 inline-block h-2 w-2 -translate-y-1/2 rounded-full bg-brand-600" />
                  <span className="ml-4 text-sm font-bold text-black lg:text-base">{t("customText.cover")}</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {customText.coverLine1 && (
                    <span className="inline-block text-sm font-normal text-black">
                      {t("customTextDisplay.line", { num: "1" })}: {customText.coverLine1}
                    </span>
                  )}
                  {customText.coverLineCount && customText.coverLineCount >= 2 && customText.coverLine2 && (
                    <span className="inline-block text-sm font-normal text-black">
                      {t("customTextDisplay.line", { num: "2" })}: {customText.coverLine2}
                    </span>
                  )}
                  {customText.coverLineCount && customText.coverLineCount >= 3 && customText.coverLine3 && (
                    <span className="inline-block text-sm font-normal text-black">
                      {t("customTextDisplay.line", { num: "3" })}: {customText.coverLine3}
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