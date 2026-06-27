import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-3 text-slate-600">Сторінку не знайдено.</p>
      <Link to="/" className="mt-6 inline-block text-slate-900 underline">
        На головну
      </Link>
    </section>
  )
}
