import { useEffect, useState } from 'react'
import type { Car, DashboardStats, ServiceVisit } from '../types'

export function DashboardView() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [recentVisits, setRecentVisits] = useState<ServiceVisit[]>([])
    const [cars, setCars] = useState<Car[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true)
                const [statsRes, visitsRes, carsRes] = await Promise.all([
                    fetch('http://localhost:5059/api/dashboard/stats'),
                    fetch('http://localhost:5059/api/service-visits'),
                    fetch('http://localhost:5059/api/cars')
                ])

                if (!statsRes.ok || !visitsRes.ok || !carsRes.ok) {
                    throw new Error('Nie udało się pobrać danych pulpitu')
                }

                const statsData = await statsRes.json()
                const visitsData: ServiceVisit[] = await visitsRes.json()
                const carsData = await carsRes.json()

                setStats(statsData)
                setRecentVisits(
                    visitsData
                        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
                        .slice(0, 5)
                )
                setCars(carsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Wystąpił błąd')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    function renderStatusBadge(status: number) {
        switch (status) {
            case 0:
                return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Zaplanowana</span>
            case 1:
                return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">W trakcie</span>
            case 2:
                return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Zakończona</span>
            case 3:
                return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Anulowana</span>
            default:
                return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Nieznany</span>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-slate-500 font-medium animate-pulse">
                Ładowanie statystyk pulpitu...
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Pulpit główny</h2>
                <p className="text-slate-500">Podsumowanie kluczowych wskaźników Twojego warsztatu</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <p className="font-medium">Błąd:</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Klienci</span>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-xl text-lg">👥</span>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-bold text-slate-900">{stats?.totalCustomers ?? 0}</span>
                        <span className="text-xs text-slate-400 block mt-1">Zarejestrowani właściciele</span>
                    </div>
                </div>

                {}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Samochody</span>
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg">🚗</span>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-bold text-slate-900">{stats?.totalCars ?? 0}</span>
                        <span className="text-xs text-slate-400 block mt-1">Pojazdy w kartotece</span>
                    </div>
                </div>

                {}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Aktywne naprawy</span>
                        <span className="p-2 bg-amber-50 text-amber-600 rounded-xl text-lg">🔧</span>
                    </div>
                    <div className="mt-3">
                        <span className="text-3xl font-bold text-slate-900">{stats?.activeVisits ?? 0}</span>
                        <span className="text-xs text-amber-600 font-medium block mt-1">Wymagające realizacji</span>
                    </div>
                </div>

                {}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500">Przychód zrealizowany</span>
                        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-lg">💰</span>
                    </div>
                    <div className="mt-3">
            <span className="text-3xl font-bold text-emerald-600">
              {(stats?.totalRevenue ?? 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
            </span>
                        <span className="text-xs text-slate-400 block mt-1">Zakończone zlecenia</span>
                    </div>
                </div>
            </div>

            {}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-semibold text-slate-800">Ostatnie zlecenia serwisowe</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Najnowsze zgłoszenia w warsztacie</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-5 py-3.5">Pojazd</th>
                            <th className="px-5 py-3.5">Data zgłoszenia</th>
                            <th className="px-5 py-3.5">Opis usterki</th>
                            <th className="px-5 py-3.5">Szacowany koszt</th>
                            <th className="px-5 py-3.5">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {recentVisits.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                                    Brak zleceń w historii.
                                </td>
                            </tr>
                        ) : (
                            recentVisits.map(visit => {
                                const car = cars.find(c => c.id === visit.carId)
                                return (
                                    <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {car ? `${car.make} ${car.model}` : 'Nieznany pojazd'}
                                            <span className="block font-mono text-xs text-slate-400 mt-0.5">{car?.licensePlate}</span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {new Date(visit.visitDate).toLocaleDateString('pl-PL', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-700 max-w-xs truncate">
                                            {visit.description}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            {visit.requestedCost.toFixed(2)} PLN
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {renderStatusBadge(visit.status)}
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
    )
}