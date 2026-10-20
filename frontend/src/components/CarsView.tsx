import { useEffect, useState } from 'react'
import type { Car, Customer } from '../types'

export function CarsView() {
    const [cars, setCars] = useState<Car[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [customerId, setCustomerId] = useState('')
    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [vin, setVin] = useState('')
    const [mileage, setMileage] = useState('')
    const [licensePlate, setLicensePlate] = useState('')

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const [carsRes, customersRes] = await Promise.all([
                    fetch('http://localhost:5059/api/cars'),
                    fetch('http://localhost:5059/api/customers')
                ])

                if (!carsRes.ok || !customersRes.ok) {
                    throw new Error('Nie udało się pobrać danych z serwera')
                }

                const carsData = await carsRes.json()
                const customersData = await customersRes.json()

                setCars(carsData)
                setCustomers(customersData)
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
            const res = await fetch('http://localhost:5059/api/cars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    make,
                    model,
                    vin,
                    mileage: Number(mileage),
                    licensePlate
                })
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || 'Nie udało się dodać samochodu')
            }

            const newCar = await res.json()
            setCars(prev => [...prev, newCar])

            setMake('')
            setModel('')
            setVin('')
            setMileage('')
            setLicensePlate('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił błąd')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Baza Samochodów</h2>
                <p className="text-slate-500">Zarządzaj pojazdami zarejestrowanymi w warsztacie</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                    <p className="font-medium">Błąd:</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Dodaj pojazd</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Właściciel</label>
                            <select
                                required
                                value={customerId}
                                onChange={e => setCustomerId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                            >
                                <option value="">Wybierz klienta...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.firstName} {c.lastName} ({c.phoneNumber})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Marka</label>
                                <input
                                    type="text"
                                    required
                                    value={make}
                                    onChange={e => setMake(e.target.value)}
                                    placeholder="np. Toyota"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                                <input
                                    type="text"
                                    required
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    placeholder="np. Corolla"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Numer VIN (17 znaków)</label>
                            <input
                                type="text"
                                required
                                minLength={17}
                                maxLength={17}
                                value={vin}
                                onChange={e => setVin(e.target.value.toUpperCase())}
                                placeholder="np. JTDBR32E720123456"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Przebieg (km)</label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    value={mileage}
                                    onChange={e => setMileage(e.target.value)}
                                    placeholder="np. 150000"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nr rejestracyjny</label>
                                <input
                                    type="text"
                                    required
                                    value={licensePlate}
                                    onChange={e => setLicensePlate(e.target.value.toUpperCase())}
                                    placeholder="np. KR12345"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                        >
                            Zarejestruj samochód
                        </button>
                    </form>
                </div>

                {}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800">Pojazdy w bazie ({cars.length})</h3>
                        {loading && <span className="text-xs text-blue-600 animate-pulse font-medium">Ładowanie...</span>}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Pojazd</th>
                                <th className="px-4 py-3">VIN / Rejestracja</th>
                                <th className="px-4 py-3">Przebieg</th>
                                <th className="px-4 py-3">Właściciel</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {cars.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                        Brak samochodów w bazie. Dodaj pierwszy pojazd.
                                    </td>
                                </tr>
                            ) : (
                                cars.map(car => {
                                    const owner = customers.find(c => c.id === car.customerId)
                                    return (
                                        <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3.5 font-medium text-slate-900">
                                                {car.make} {car.model}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-mono text-xs text-slate-800 font-semibold">{car.licensePlate}</div>
                                                <div className="font-mono text-[11px] text-slate-400">{car.vin}</div>
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-slate-700">
                                                {car.mileage.toLocaleString()} km
                                            </td>
                                            <td className="px-4 py-3.5 text-slate-600">
                                                {owner ? `${owner.firstName} ${owner.lastName}` : 'Nieznany'}
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