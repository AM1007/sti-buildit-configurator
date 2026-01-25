import { useState } from "react";
import type { CustomTextData, CustomTextVariant } from "../types";
import { getEffectiveLineCount } from "../utils/customTextHelpers";
import { useTranslation } from "../i18n";

interface CustomTextFormProps {
  variant: CustomTextVariant;
  maxLength: number;
  onSubmit: (data: Omit<CustomTextData, "submitted">) => void;
  initialData?: CustomTextData;
}

export function CustomTextForm({ variant, maxLength, onSubmit, initialData }: CustomTextFormProps) {
  const { t } = useTranslation();
  const isDualBlock = variant === "dual-block-three-line";

  const getInitialLineCount = (): 1 | 2 | 3 => {
    if (variant === "singleline") return 1;
    if (variant === "multiline-fixed") return 2;
    if (variant === "dual-block-three-line") return initialData?.lineCount ?? 3;
    return initialData?.lineCount ?? 2;
  };

  const getInitialCoverLineCount = (): 1 | 2 | 3 => {
    return initialData?.coverLineCount ?? 3;
  };

  const [selectedLineCount, setSelectedLineCount] = useState<1 | 2 | 3>(getInitialLineCount());
  const [line1, setLine1] = useState(initialData?.line1 ?? "");
  const [line2, setLine2] = useState(initialData?.line2 ?? "");
  const [line3, setLine3] = useState(initialData?.line3 ?? "");

  const [coverLineCount, setCoverLineCount] = useState<1 | 2 | 3>(getInitialCoverLineCount());
  const [coverLine1, setCoverLine1] = useState(initialData?.coverLine1 ?? "");
  const [coverLine2, setCoverLine2] = useState(initialData?.coverLine2 ?? "");
  const [coverLine3, setCoverLine3] = useState(initialData?.coverLine3 ?? "");

  const [errors, setErrors] = useState<string[]>([]);

  const effectiveLineCount = getEffectiveLineCount(variant, selectedLineCount);
  const showLineCountSelector = variant === "multiline-selectable" || variant === "dual-block-three-line";
  const showLine2 = effectiveLineCount >= 2;
  const showLine3 = effectiveLineCount >= 3;

  const handleLineCountChange = (value: 1 | 2 | 3) => {
    setSelectedLineCount(value);
    if (value < 2) {
      setLine2("");
      setLine3("");
    } else if (value < 3) {
      setLine3("");
    }
    setErrors([]);
  };

  const handleCoverLineCountChange = (value: 1 | 2 | 3) => {
    setCoverLineCount(value);
    if (value < 2) {
      setCoverLine2("");
      setCoverLine3("");
    } else if (value < 3) {
      setCoverLine3("");
    }
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: string[] = [];

    if (!line1.trim()) {
      validationErrors.push(t("customText.labelLine1Required"));
    }

    if (line1.length > maxLength) {
      validationErrors.push(t("customText.lineExceedsMax", { line: "1", max: maxLength.toString() }));
    }

    if (showLine2 && line2.length > maxLength) {
      validationErrors.push(t("customText.lineExceedsMax", { line: "2", max: maxLength.toString() }));
    }

    if (showLine3 && line3.length > maxLength) {
      validationErrors.push(t("customText.lineExceedsMax", { line: "3", max: maxLength.toString() }));
    }

    if (isDualBlock) {
      if (!coverLine1.trim()) {
        validationErrors.push(t("customText.coverLine1Required"));
      }

      if (coverLine1.length > maxLength) {
        validationErrors.push(t("customText.coverLineExceedsMax", { line: "1", max: maxLength.toString() }));
      }

      if (coverLineCount >= 2 && coverLine2.length > maxLength) {
        validationErrors.push(t("customText.coverLineExceedsMax", { line: "2", max: maxLength.toString() }));
      }

      if (coverLineCount >= 3 && coverLine3.length > maxLength) {
        validationErrors.push(t("customText.coverLineExceedsMax", { line: "3", max: maxLength.toString() }));
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      lineCount: effectiveLineCount as 1 | 2 | 3,
      line1,
      line2: showLine2 ? line2 : "",
      line3: showLine3 ? line3 : "",
      coverLineCount: isDualBlock ? coverLineCount : undefined,
      coverLine1: isDualBlock ? coverLine1 : undefined,
      coverLine2: isDualBlock && coverLineCount >= 2 ? coverLine2 : undefined,
      coverLine3: isDualBlock && coverLineCount >= 3 ? coverLine3 : undefined,
    });
  };

  const renderLineCountSelector = (
    name: string,
    value: 1 | 2 | 3,
    onChange: (val: 1 | 2 | 3) => void,
    showThreeLine: boolean
  ) => (
    <div className="mb-3 flex items-center justify-center gap-3 lg:mb-4">
      <label className="flex items-center justify-start gap-2 text-sm font-normal">
        <input
          type="radio"
          name={name}
          value={1}
          checked={value === 1}
          onChange={() => onChange(1)}
          className="size-4 appearance-none rounded-full border border-solid border-gray-400 
                     checked:border-[5px] checked:border-brand-600"
        />
        <span>{t("customText.lineCount", { count: "1" })}</span>
      </label>

      <label className="flex items-center justify-start gap-2 text-sm font-normal">
        <input
          type="radio"
          name={name}
          value={2}
          checked={value === 2}
          onChange={() => onChange(2)}
          className="size-4 appearance-none rounded-full border border-solid border-gray-400 
                     checked:border-[5px] checked:border-brand-600"
        />
        <span>{t("customText.lineCount", { count: "2" })}</span>
      </label>

      {showThreeLine && (
        <label className="flex items-center justify-start gap-2 text-sm font-normal">
          <input
            type="radio"
            name={name}
            value={3}
            checked={value === 3}
            onChange={() => onChange(3)}
            className="size-4 appearance-none rounded-full border border-solid border-gray-400 
                       checked:border-[5px] checked:border-brand-600"
          />
          <span>{t("customText.lineCount", { count: "3" })}</span>
        </label>
      )}
    </div>
  );

  const inputClassName = `flex min-h-10 w-full items-center justify-start border border-solid 
                          border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-normal 
                          text-gray-800 placeholder:text-gray-500 
                          hover:border-gray-500 focus:border-gray-500 focus:outline-none 
                          lg:min-h-11 lg:py-2`;

  return (
    <div className="flex w-full justify-center">
      <div className="max-w-126 flex-1">
        <p className="mb-5 text-center text-base font-normal lg:mb-7 lg:text-lg">
          {t("customText.enterLabel")}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid w-full grid-cols-1 gap-7">
            <div className="w-full">
              <p className="mb-4 text-center text-base font-bold lg:text-lg">
                {t("customText.label")}
              </p>

              {showLineCountSelector && renderLineCountSelector(
                "lineCount",
                selectedLineCount,
                handleLineCountChange,
                isDualBlock
              )}

              <div className="grid grid-cols-1 gap-3">
                <div className="flex w-full flex-col gap-1">
                  <input
                    type="text"
                    name="line1"
                    placeholder={t("customText.linePlaceholder", { line: "1" })}
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    maxLength={maxLength}
                    autoComplete="off"
                    className={inputClassName}
                  />
                </div>

                {showLine2 && (
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="text"
                      name="line2"
                      placeholder={t("customText.linePlaceholder", { line: "2" })}
                      value={line2}
                      onChange={(e) => setLine2(e.target.value)}
                      maxLength={maxLength}
                      autoComplete="off"
                      className={inputClassName}
                    />
                  </div>
                )}

                {showLine3 && (
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="text"
                      name="line3"
                      placeholder={t("customText.linePlaceholder", { line: "3" })}
                      value={line3}
                      onChange={(e) => setLine3(e.target.value)}
                      maxLength={maxLength}
                      autoComplete="off"
                      className={inputClassName}
                    />
                  </div>
                )}
              </div>

              <span className="mt-1 block text-center text-sm text-gray-500">
                {t("customText.maxCharacters", { max: maxLength.toString() })}
              </span>
            </div>

            {isDualBlock && (
              <div className="w-full">
                <p className="mb-4 text-center text-base font-bold lg:text-lg">
                  {t("customText.cover")}
                </p>

                {renderLineCountSelector(
                  "coverLineCount",
                  coverLineCount,
                  handleCoverLineCountChange,
                  true
                )}

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="text"
                      name="coverLine1"
                      placeholder={t("customText.linePlaceholder", { line: "1" })}
                      value={coverLine1}
                      onChange={(e) => setCoverLine1(e.target.value)}
                      maxLength={maxLength}
                      autoComplete="off"
                      className={inputClassName}
                    />
                  </div>

                  {coverLineCount >= 2 && (
                    <div className="flex w-full flex-col gap-1">
                      <input
                        type="text"
                        name="coverLine2"
                        placeholder={t("customText.linePlaceholder", { line: "2" })}
                        value={coverLine2}
                        onChange={(e) => setCoverLine2(e.target.value)}
                        maxLength={maxLength}
                        autoComplete="off"
                        className={inputClassName}
                      />
                    </div>
                  )}

                  {coverLineCount >= 3 && (
                    <div className="flex w-full flex-col gap-1">
                      <input
                        type="text"
                        name="coverLine3"
                        placeholder={t("customText.linePlaceholder", { line: "3" })}
                        value={coverLine3}
                        onChange={(e) => setCoverLine3(e.target.value)}
                        maxLength={maxLength}
                        autoComplete="off"
                        className={inputClassName}
                      />
                    </div>
                  )}
                </div>

                <span className="mt-1 block text-center text-sm text-gray-500">
                  {t("customText.maxCharacters", { max: maxLength.toString() })}
                </span>
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div className="mt-4 text-center text-sm text-brand-600">
              {errors.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          )}

          <div className="mt-10 flex w-full flex-col items-center gap-2 lg:gap-4">
            <button
              type="submit"
              className="inline-flex min-h-9 items-center justify-center border-4 border-brand-600 
                         bg-brand-600 px-4.5 py-0.5 text-sm font-bold text-white 
                         transition-all duration-300 hover:border-brand-700 hover:bg-brand-700 
                         focus:border-red-300 lg:min-h-11 lg:px-6 lg:py-1 lg:text-base"
            >
              {t("common.submit")}
            </button>

            <span className="block text-center text-sm text-brand-600">
              {t("customText.nonReturnable")}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}