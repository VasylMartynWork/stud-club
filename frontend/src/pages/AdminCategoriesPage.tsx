import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { categoriesApi } from '@/shared/api/categories-api'
import type { Category } from '@/shared/api/types'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadCategories() {
    setIsLoading(true)
    try {
      const { data } = await categoriesApi.list()
      setCategories(data.items)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await categoriesApi.create(newName.trim())
      setNewName('')
      await loadCategories()
    } catch {
      setError('Не вдалося створити категорію. Можливо, така назва вже існує.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditingName(category.name)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
  }

  async function handleUpdate(categoryId: string) {
    setError(null)
    setIsSubmitting(true)

    try {
      await categoriesApi.update(categoryId, editingName.trim())
      setEditingId(null)
      setEditingName('')
      await loadCategories()
    } catch {
      setError('Не вдалося оновити категорію.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(`Видалити категорію «${category.name}»?`)

    if (!confirmed) {
      return
    }

    setError(null)

    try {
      await categoriesApi.delete(category.id)
      await loadCategories()
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError('Неможливо видалити категорію, до якої належать публікації. Спочатку видаліть або перемістіть їх.')
        return
      }

      setError('Не вдалося видалити категорію.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Категорії</h1>
        <p className="mt-2 text-sm text-slate-600">
          Керування категоріями блогу. Категорію можна видалити лише якщо до неї не належать
          публікації.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold">Нова категорія</h2>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreate}>
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Назва категорії"
            required
            minLength={2}
            maxLength={100}
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting}>
            Додати
          </Button>
        </form>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Завантаження категорій...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Категорій ще немає.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                {editingId === category.id ? (
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                    <Input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      required
                      minLength={2}
                      maxLength={100}
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => void handleUpdate(category.id)}
                      >
                        Зберегти
                      </Button>
                      <Button type="button" variant="secondary" onClick={cancelEdit}>
                        Скасувати
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-slate-900">{category.name}</span>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => startEdit(category)}>
                        Редагувати
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void handleDelete(category)}
                      >
                        Видалити
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
