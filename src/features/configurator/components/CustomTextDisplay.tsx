import type { CustomTextData } from '@shared/types'
import { useTranslation } from '@shared/i18n'
import { Type } from 'lucide-react'

interface CustomTextDisplayProps {
  customText: CustomTextData
}

export function CustomTextDisplay({ customText }: CustomTextDisplayProps) {
  const { t } = useTranslation()
  const hasCoverData =
    customText.coverLine1 || customText.coverLine2 || customText.coverLine3

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-[10px] md:text-slate-400">
          {t('customTextDisplay.title')}
        </span>
        <span className="inline-flex items-center rounded-sm bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
          {t('customTextDisplay.nonReturnable')}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <TextBlock
          icon={<Type className="h-3.5 w-3.5 text-brand-600" />}
          title={t('customText.label')}
          lines={buildLines(
            customText.lineCount,
            customText.line1,
            customText.line2,
            customText.line3,
          )}
          t={t}
        />

        {hasCoverData && (
          <TextBlock
            icon={<Type className="h-3.5 w-3.5 text-brand-600" />}
            title={t('customText.cover')}
            lines={buildLines(
              customText.coverLineCount ?? 1,
              customText.coverLine1,
              customText.coverLine2,
              customText.coverLine3,
            )}
            t={t}
          />
        )}
      </div>
    </div>
  )
}

function buildLines(
  lineCount: number,
  line1?: string,
  line2?: string,
  line3?: string,
): { num: string; text: string }[] {
  const lines: { num: string; text: string }[] = []
  if (line1) lines.push({ num: '1', text: line1 })
  if (lineCount >= 2 && line2) lines.push({ num: '2', text: line2 })
  if (lineCount >= 3 && line3) lines.push({ num: '3', text: line3 })
  return lines
}

interface TextBlockProps {
  icon: React.ReactNode
  title: string
  lines: { num: string; text: string }[]
  t: (key: string, params?: Record<string, string>) => string
}

function TextBlock({ icon, title, lines, t }: TextBlockProps) {
  return (
    <div className="rounded-sm border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="text-[13px] font-semibold text-slate-700 md:text-xs">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 pl-5">
        {lines.map((line) => (
          <span key={line.num} className="text-[13px] text-slate-600 md:text-xs">
            <span className="text-slate-400">
              {t('customTextDisplay.line', { num: line.num })}:
            </span>{' '}
            {line.text}
          </span>
        ))}
      </div>
    </div>
  )
}
