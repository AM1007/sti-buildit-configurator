import type { CustomTextData, CustomTextVariant } from '../types'

export function getEffectiveLineCount(
  variant: CustomTextVariant,
  selectedLineCount: 1 | 2 | 3,
): 1 | 2 | 3 {
  switch (variant) {
    case 'singleline':
      return 1
    case 'multiline-fixed':
      return 2
    case 'multiline-three-line':
      return 3
    case 'multiline-selectable':
      return selectedLineCount
    case 'dual-block-three-line':
      return selectedLineCount
  }
}

function collectLines(
  lineCount: number,
  line1?: string,
  line2?: string,
  line3?: string,
): string[] {
  const result: string[] = []
  if (line1) result.push(line1)
  if (lineCount >= 2 && line2) result.push(line2)
  if (lineCount >= 3 && line3) result.push(line3)
  return result
}

export function formatCustomTextInline(customText: CustomTextData): string {
  const labelLines = collectLines(
    customText.lineCount,
    customText.line1,
    customText.line2,
    customText.line3,
  )

  const coverLines = collectLines(
    customText.coverLineCount ?? 1,
    customText.coverLine1,
    customText.coverLine2,
    customText.coverLine3,
  )

  const parts: string[] = []

  if (labelLines.length > 0) {
    parts.push(labelLines.join(' / '))
  }

  if (coverLines.length > 0) {
    parts.push(coverLines.join(' / '))
  }

  return parts.join(' · ')
}

type BlockLang = 'en' | 'uk'

const BLOCK_LABELS: Record<
  BlockLang,
  {
    label: string
    cover: string
    line: string
    nonReturnable: string
  }
> = {
  en: {
    label: 'Custom Label',
    cover: 'Cover Text',
    line: 'Line',
    nonReturnable: '⚠ Non-Returnable',
  },
  uk: {
    label: 'Замовний текст',
    cover: 'Текст кришки',
    line: 'Рядок',
    nonReturnable: '⚠ Без повернення',
  },
}

export function formatCustomTextBlock(
  customText: CustomTextData,
  lang: BlockLang = 'en',
): string {
  const l = BLOCK_LABELS[lang] ?? BLOCK_LABELS.en

  const labelLines = collectLines(
    customText.lineCount,
    customText.line1,
    customText.line2,
    customText.line3,
  )

  const coverLines = collectLines(
    customText.coverLineCount ?? 1,
    customText.coverLine1,
    customText.coverLine2,
    customText.coverLine3,
  )

  const sections: string[] = []

  if (labelLines.length > 0) {
    const header = `${l.label}:`
    const lines = labelLines.map((text, i) => `${l.line} ${i + 1}: ${text}`)
    sections.push([header, ...lines].join('\n'))
  }

  if (coverLines.length > 0) {
    const header = `${l.cover}:`
    const lines = coverLines.map((text, i) => `${l.line} ${i + 1}: ${text}`)
    sections.push([header, ...lines].join('\n'))
  }

  if (sections.length > 0) {
    sections.push(l.nonReturnable)
  }

  return sections.join('\n\n')
}

export function buildCustomTextFingerprint(
  customText: CustomTextData | null | undefined,
): string | null {
  if (!customText?.submitted) return null

  const parts = [
    String(customText.lineCount),
    customText.line1 ?? '',
    customText.line2 ?? '',
    customText.line3 ?? '',
    String(customText.coverLineCount ?? 0),
    customText.coverLine1 ?? '',
    customText.coverLine2 ?? '',
    customText.coverLine3 ?? '',
  ]

  return parts.join('\x00')
}
