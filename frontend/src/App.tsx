import { useAuth } from './context/AuthContext'
import { LoginModal } from './components/LoginModal'
import { useState } from 'react'
import { CustomersView } from './components/CustomersView'
import { CarsView } from './components/CarsView'
import { VisitsView } from './components/VisitsView'
import { DashboardView } from './components/DashBoardView'

type Tab = 'customers' | 'cars' | 'dashboard' | 'visits'

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard')
    const { user, logout } = useAuth()
    const [isLoginOpen, setIsLoginOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Lewa strona: Logo */}
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">🚗</span>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">Car Service Manager</h1>
                                <p className="text-xs text-slate-500">System zarządzania warsztatem</p>
                            </div>
                        </div>

                        {/* Środek: Zakładki nawigacji */}
                        <nav className="flex space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                    activeTab === 'dashboard'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                📊 Pulpit
                            </button>

                            <button
                                onClick={() => setActiveTab('customers')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                    activeTab === 'customers'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                👥 Klienci
                            </button>

                            <button
                                onClick={() => setActiveTab('cars')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                    activeTab === 'cars'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                🚗 Samochody
                            </button>

                            <button
                                onClick={() => setActiveTab('visits')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                                    activeTab === 'visits'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                🔧 Wizyty serwisowe
                            </button>
                        </nav>

                        {/* Prawa strona: Logowanie / Użytkownik */}
                        <div className="flex items-center space-x-3">
                            {user ? (
                                <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-sm">
                                    <div className="text-right">
                                        <span className="font-semibold text-slate-800 text-xs block">{user.email}</span>
                                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{user.role}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded hover:bg-rose-50 transition"
                                    >
                                        Wyloguj
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsLoginOpen(true)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2 rounded-xl transition shadow-sm"
                                >
                                    🔑 Zaloguj się
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && <DashboardView />}

                {activeTab === 'customers' && <CustomersView />}

                {activeTab === 'cars' && <CarsView />}

                {activeTab === 'visits' && <VisitsView/>}
            </main>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    )
}