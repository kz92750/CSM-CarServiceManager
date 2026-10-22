import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type AuthUser = {
    email: string
    role: string
}

type AuthContextType = {
    token: string | null
    user: AuthUser | null
    login: (token: string, email: string, role: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<AuthUser | null>(null)

    useEffect(() => {
        const savedToken = localStorage.getItem('token')
        const savedEmail = localStorage.getItem('email')
        const savedRole = localStorage.getItem('role')

        if (savedToken && savedEmail && savedRole) {
            setToken(savedToken)
            setUser({ email: savedEmail, role: savedRole })
        }
    }, [])

    function login(newToken: string, email: string, role: string) {
        localStorage.setItem('token', newToken)
        localStorage.setItem('email', email)
        localStorage.setItem('role', role)

        setToken(newToken)
        setUser({ email, role })
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        localStorage.removeItem('role')

        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}