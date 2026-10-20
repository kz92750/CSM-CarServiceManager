import { useEffect, useState } from 'react'
import type { Customer } from '../types'

export function CustomersView() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')


    useEffect(() => {
        async function fetchCustomers() {
            try {
                setLoading(true)
                const res = await fetch('http://localhost:5059/api/customers')
                if (!res.ok) throw new Error('Nie udało się pobrać listy klientów')
                const data = await res.json()
                setCustomers(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Wystąpił błąd')
            } finally {
                setLoading(false)
            }
        }

        fetchCustomers()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            setError(null)
            const res = await fetch('http://localhost:5059/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, phoneNumber })
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || 'Nie udało się dodać klienta')
            }

            const newCustomer = await res.json()
            setCustomers(prev => [...prev, newCustomer])

            setFirstName('')
            setLastName('')
            setEmail('')
            setPhoneNumber('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Baza Klientów</h2>
                <p className="text-slate-500">Zarządzaj właścicielami pojazdów i ich danymi kontaktowymi</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <p className="font-medium">Błąd:</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolumna 1: Formularz dodawania */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Dodaj nowego klienta</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imię</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="np. Jan"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nazwisko</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="np. Kowalski"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="jan@example.com"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Numer telefonu</label>
                            <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                placeholder="+48 123 456 789"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                        >
                            Zapisz klienta
                        </button>
                    </form>
                </div>

                {}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800">Zarejestrowani klienci ({customers.length})</h3>
                        {loading && <span className="text-xs text-blue-600 animate-pulse font-medium">Ładowanie...</span>}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Klient</th>
                                <th className="px-4 py-3">Telefon</th>
                                <th className="px-4 py-3">Email</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {customers.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                                        Brak klientów w bazie. Dodaj pierwszego za pomocą formularza.
                                    </td>
                                </tr>
                            ) : (
                                customers.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-3.5 font-medium text-slate-900">
                                            {c.firstName} {c.lastName}
                                        </td>
                                        <td className="px-4 py-3.5">{c.phoneNumber}</td>
                                        <td className="px-4 py-3.5 text-slate-500">{c.email}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}