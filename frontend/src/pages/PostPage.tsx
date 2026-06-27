import { useParams } from 'react-router-dom'

export function PostPage() {
  const { id } = useParams()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Публікація</h1>
      <p className="mt-3 text-slate-600">ID: {id}</p>
    </section>
  )
}
