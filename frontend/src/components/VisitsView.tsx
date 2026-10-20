import { useEffect, useState } from 'react'
import type { Car, ServiceVisit } from '../types'

export function VisitsView() {
    const [visits, setVisits] = useState<ServiceVisit[]>([])
    const [cars, setCars] = useState<Car[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [carId, setCarId] = useState('')
    const [visitDate, setVisitDate] = useState('')
    const [description, setDescription] = useState('')
    const [requestedCost, setRequestedCost] = useState('')

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const [visitsRes, carsRes] = await Promise.all([
                    fetch('http://localhost:5059/api/service-visits'),
                    fetch('http://localhost:5059/api/cars')
                ])

                if (!visitsRes.ok || !carsRes.ok) {
                    throw new Error('Nie udało się pobrać danych')
                }

                const visitsData = await visitsRes.json()
                const carsData = await carsRes.json()

                setVisits(visitsData)
                setCars(carsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Wystąpił błąd')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            setError(null)
            const res = await fetch('http://localhost:5059/api/service-visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    carId,
                    visitDate: new Date(visitDate).toISOString(),
                    description,
                    requestedCost: Number(requestedCost)
                })
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || 'Nie udało się zarezerwować wizyty')
            }

            const newVisit = await res.json()
            setVisits(prev => [...prev, newVisit])

            // Czyszczenie formularza
            setDescription('')
            setRequestedCost('')
            setVisitDate('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd')
        }
    }

    async function handleStatusChange(visitId: string, action: 'start' | 'complete' | 'cancel') {
        try {
            setError(null)
            const res = await fetch(`http://localhost:5059/api/service-visits/${visitId}/${action}`, {
                method: 'POST'
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || `Nie udało się wykonać akcji: ${action}`)
            }

            const updatedVisit = await res.json()

            setVisits(prev => prev.map(v => (v.id === updatedVisit.id ? updatedVisit : v)))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd')
        }
    }

    function renderStatusBadge(status: number) {
        switch (status) {
            case 0:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Zaplanowana</span>
            case 1:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">W trakcie</span>
            case 2:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Zakończona</span>
            case 3:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Anulowana</span>
            default:
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Nieznany</span>
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Zlecenia i Wizyty Serwisowe</h2>
                <p className="text-slate-500">Rejestruj naprawy i zarządzaj statusem prac w warsztacie</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <p className="font-medium">Błąd:</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formularz nowej wizyty */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Nowe zlecenie naprawy</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pojazd</label>
                            <select
                                required
                                value={carId}
                                onChange={e => setCarId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                            >
                                <option value="">Wybierz samochód...</option>
                                {cars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.make} {car.model} ({car.licensePlate})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Data i godzina wizyty</label>
                            <input
                                type="datetime-local"
                                required
                                value={visitDate}
                                onChange={e => setVisitDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Szacowany koszt (PLN)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={requestedCost}
                                onChange={e => setRequestedCost(e.target.value)}
                                placeholder="np. 350.00"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Opis usterki / zakres prac</label>
                            <textarea
                                required
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="np. Wymiana oleju i filtrów, stuki w przednim zawieszeniu..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                        >
                            Utwórz zlecenie
                        </button>
                    </form>
                </div>

                {/* Tabela wizyt */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800">Aktywne i zakończone zlecenia ({visits.length})</h3>
                        {loading && <span className="text-xs text-blue-600 animate-pulse font-medium">Ładowanie...</span>}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Pojazd / Data</th>
                                <th className="px-4 py-3">Opis naprawy</th>
                                <th className="px-4 py-3">Koszt</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Akcje</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {visits.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                        Brak zleceń w systemie. Utwórz pierwszą wizytę.
                                    </td>
                                </tr>
                            ) : (
                                visits.map(visit => {
                                    const car = cars.find(c => c.id === visit.carId)
                                    return (
                                        <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-slate-900">
                                                    {car ? `${car.make} ${car.model}` : 'Nieznany pojazd'}
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono">
                                                    {new Date(visit.visitDate).toLocaleDateString('pl-PL', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 max-w-xs text-slate-700 text-xs truncate">
                                                {visit.description}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                                {visit.requestedCost.toFixed(2)} PLN
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                {renderStatusBadge(visit.status)}
                                            </td>
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                <div className="inline-flex space-x-1.5">
                                                    {/* Jeśli wizyta jest zaplanowana (0), mechanik może ją rozpocząć lub anulować */}
                                                    {visit.status === 0 && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(visit.id, 'start')}
                                                                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition border border-blue-200"
                                                            >
                                                                ▶ Rozpocznij
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(visit.id, 'cancel')}
                                                                className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition border border-rose-200"
                                                            >
                                                                ✕ Anuluj
                                                            </button>
                                                        </>
                                                    )}

                                                    {}
                                                    {visit.status === 1 && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(visit.id, 'complete')}
                                                                className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition border border-emerald-200"
                                                            >
                                                                ✓ Zakończ
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(visit.id, 'cancel')}
                                                                className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition border border-rose-200"
                                                            >
                                                                ✕ Anuluj
                                                            </button>
                                                        </>
                                                    )}

                                                    {}
                                                    {(visit.status === 2 || visit.status === 3) && (
                                                        <span className="text-xs text-slate-400 italic">Zlecenie zamknięte</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}