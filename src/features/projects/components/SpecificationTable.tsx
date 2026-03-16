import { useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Trash2 } from 'lucide-react'
import type { SavedConfiguration } from '@shared/types'
import { MODEL_NAMES } from '@shared/types'
import { getModelById } from '@entities/product/models'
import { buildShareableUrl } from '@shared/utils/configSerializer'
import { formatCustomTextInline } from '@shared/utils/customTextHelpers'
import { useTranslation } from '@shared/i18n'

interface SpecificationTableProps {
  items: SavedConfiguration[]
  onQtyChange: (id: string, qty: number) => void
  onNoteChange: (id: string, note: string) => void
  onViewDetails: (id: string) => void
  onRemove: (id: string) => void
}

export function SpecificationTable({
  items,
  onQtyChange,
  onNoteChange,
  onViewDetails,
  onRemove,
}: SpecificationTableProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full border border-slate-200 rounded-sm bg-white">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-40">
                {t('specTable.sku')}
              </th>
              <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('specTable.modelName')}
              </th>
              <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-20">
                {t('specTable.qty')}
              </th>
              <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-72">
                {t('specTable.note')}
              </th>
              <th className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-20 text-right">
                {t('specTable.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <SpecificationRow
                key={item.id}
                item={item}
                onQtyChange={onQtyChange}
                onNoteChange={onNoteChange}
                onViewDetails={onViewDetails}
                onRemove={onRemove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface SpecificationRowProps {
  item: SavedConfiguration
  onQtyChange: (id: string, qty: number) => void
  onNoteChange: (id: string, note: string) => void
  onViewDetails: (id: string) => void
  onRemove: (id: string) => void
}

function SpecificationRow({
  item,
  onQtyChange,
  onNoteChange,
  onViewDetails,
  onRemove,
}: SpecificationRowProps) {
  const { t } = useTranslation()
  const modelName = MODEL_NAMES[item.modelId] ?? item.modelId
  const isCustomBuilt = hasCustomConfiguration(item.configuration)

  const configuratorUrl = buildConfiguratorUrl(item)

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">
      <td className="py-1.5 px-3">
        <Link
          to={configuratorUrl}
          className={`text-xs font-mono transition-colors ${
            isCustomBuilt
              ? 'text-blue-600 hover:text-blue-800'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {item.productCode}
        </Link>
      </td>

      <td className="py-1.5 px-3">
        <span className="text-xs text-slate-900 block">{modelName}</span>
        {item.customText?.submitted && (
          <span
            className="text-[10px] text-slate-400 block truncate max-w-[260px]"
            title={formatCustomTextInline(item.customText)}
          >
            {formatCustomTextInline(item.customText)}
          </span>
        )}
      </td>

      <td className="py-1.5 px-3">
        <InlineQtyInput id={item.id} value={item.qty} onChange={onQtyChange} />
      </td>

      <td className="py-1.5 px-3">
        <InlineNoteInput
          id={item.id}
          value={item.note}
          placeholder={t('myList.notePlaceholder')}
          onChange={onNoteChange}
        />
      </td>

      <td className="py-1.5 px-3">
        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            onClick={() => onViewDetails(item.id)}
            className="p-1 text-slate-500 hover:text-slate-900 rounded-sm hover:bg-slate-200/50 transition-colors"
            title={t('productCard.viewDetails')}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1 text-slate-500 hover:text-red-600 rounded-sm hover:bg-red-50 transition-colors"
            title={t('myList.removeItem')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

interface InlineQtyInputProps {
  id: string
  value: number
  onChange: (id: string, qty: number) => void
}

function InlineQtyInput({ id, value, onChange }: InlineQtyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10)
      if (!Number.isNaN(parsed)) {
        onChange(id, parsed)
      }
    },
    [id, onChange],
  )

  const handleBlur = useCallback(() => {
    if (inputRef.current) {
      const parsed = parseInt(inputRef.current.value, 10)
      if (Number.isNaN(parsed) || parsed < 1) {
        onChange(id, 1)
      }
    }
  }, [id, onChange])

  return (
    <input
      ref={inputRef}
      type="number"
      min={1}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-14 bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-slate-300 rounded-sm px-1.5 py-0.5 text-xs font-mono text-slate-900 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  )
}

interface InlineNoteInputProps {
  id: string
  value: string
  placeholder: string
  onChange: (id: string, note: string) => void
}

function InlineNoteInput({ id, value, placeholder, onChange }: InlineNoteInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(id, e.target.value)
    },
    [id, onChange],
  )

  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-slate-300 rounded-sm px-1.5 py-0.5 text-xs text-slate-600 outline-none transition-all placeholder:text-slate-300"
    />
  )
}

function hasCustomConfiguration(
  configuration: SavedConfiguration['configuration'],
): boolean {
  return Object.values(configuration).some((v) => v !== null)
}

function buildConfiguratorUrl(item: SavedConfiguration): string {
  const model = getModelById(item.modelId)
  if (!model) return '/'

  return buildShareableUrl(
    `/configurator/${model.slug}`,
    model.id,
    item.configuration,
    item.customText,
  )
}
