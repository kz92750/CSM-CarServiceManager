import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            setLoading(true)
            setError(null)

            const res = await fetch('http://localhost:5059/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                throw new Error('Nieprawidłowy email lub hasło')
            }

            const data = await res.json()
            login(data.token, data.email, data.role)
            onClose()
            setEmail('')
            setPassword('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd logowania')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-slate-800">Logowanie do systemu</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
                </div>

                {error && (
                    <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="np. mechanik@carservice.pl"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hasło</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </button>
                </form>
            </div>
        </div>
    )
}