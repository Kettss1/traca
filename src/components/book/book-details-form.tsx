'use client'

import { useState } from 'react'
import { CalendarBlank, CurrencyDollar, Tag, FloppyDisk } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateUserBook } from '@/lib/actions/book'

interface BookDetailsFormProps {
  userBookId: string
  currentPage?: number | null
  pageCount?: number | null
  acquisitionDate?: Date | null
  acquisitionValue?: number | null
  startDate?: Date | null
  finishDate?: Date | null
  tags: string[]
}

export function BookDetailsForm({
  userBookId,
  currentPage,
  pageCount,
  acquisitionDate,
  acquisitionValue,
  startDate,
  finishDate,
  tags: initialTags,
}: BookDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(currentPage?.toString() || '')
  const [acqDate, setAcqDate] = useState(
    acquisitionDate ? new Date(acquisitionDate).toISOString().split('T')[0] : ''
  )
  const [acqValue, setAcqValue] = useState(acquisitionValue?.toString() || '')
  const [start, setStart] = useState(
    startDate ? new Date(startDate).toISOString().split('T')[0] : ''
  )
  const [finish, setFinish] = useState(
    finishDate ? new Date(finishDate).toISOString().split('T')[0] : ''
  )
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '))

  async function handleSave() {
    setIsSaving(true)
    setError(null)

    const result = await updateUserBook({
      userBookId,
      currentPage: page ? parseInt(page) : undefined,
      acquisitionDate: acqDate ? new Date(acqDate) : null,
      acquisitionValue: acqValue ? parseFloat(acqValue) : null,
      startDate: start ? new Date(start) : null,
      finishDate: finish ? new Date(finish) : null,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })

    setIsSaving(false)

    if (result.success) {
      setIsEditing(false)
    } else {
      setError(result.error)
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-dark">Detalhes</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-green-deep hover:underline"
          >
            Editar
          </button>
        </div>

        <div className="grid gap-3 text-sm">
          {currentPage && pageCount && (
            <div className="flex items-center gap-2 text-text-muted">
              <span>Página {currentPage} de {pageCount}</span>
              <div className="h-1.5 flex-1 rounded-full bg-cream-dark">
                <div
                  className="h-full rounded-full bg-green-deep"
                  style={{ width: `${(currentPage / pageCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {acquisitionDate && (
            <div className="flex items-center gap-2 text-text-muted">
              <CalendarBlank className="h-4 w-4" />
              <span>
                Adquirido em{' '}
                {new Date(acquisitionDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}

          {acquisitionValue && (
            <div className="flex items-center gap-2 text-text-muted">
              <CurrencyDollar className="h-4 w-4" />
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(acquisitionValue)}
              </span>
            </div>
          )}

          {startDate && (
            <div className="text-text-muted">
              Início: {new Date(startDate).toLocaleDateString('pt-BR')}
            </div>
          )}

          {finishDate && (
            <div className="text-text-muted">
              Término: {new Date(finishDate).toLocaleDateString('pt-BR')}
            </div>
          )}

          {initialTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-text-muted" />
              {initialTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-green-light/20 px-2 py-0.5 text-xs text-green-deep"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!acquisitionDate && !acquisitionValue && initialTags.length === 0 && !startDate && !finishDate && (
            <p className="text-text-muted">Nenhum detalhe adicionado ainda.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-text-dark">Editar Detalhes</h3>

      {error && (
        <div className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-4">
        {pageCount && (
          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Página atual (de {pageCount})
            </label>
            <Input
              type="number"
              min={0}
              max={pageCount}
              value={page}
              onChange={(e) => setPage(e.target.value)}
              placeholder="0"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Data de aquisição
            </label>
            <Input
              type="date"
              value={acqDate}
              onChange={(e) => setAcqDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Valor (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={acqValue}
              onChange={(e) => setAcqValue(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Data de início
            </label>
            <Input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">
              Data de término
            </label>
            <Input
              type="date"
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-muted">
            Tags (separadas por vírgula)
          </label>
          <Input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="ficção, favorito, presente"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
        >
          <FloppyDisk className="mr-1 h-4 w-4" />
          Salvar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
