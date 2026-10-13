import { useEffect, useState } from 'react'

type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

function App() {

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')


    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    fetch('http://localhost:5059/api/customers')
        .then (res => {
            if (!res.ok) {
                throw new Error('Nie udało się pobrać klientów')
            }
            return res.json()
        })
    .then(data => setCustomers(data))
        .catch(err => setError(err))
        .finally(() => setLoading(false))
  }, []);
    async function handleSumbit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:5059/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstName, lastName, email, phoneNumber })
            })
            if (!res.ok) {
                throw new Error('Nie udało się dodać klienta')
            }
            const newCustomer = await res.json()
            setCustomers([...customers, newCustomer])
            setFirstName('')
            setLastName('')
            setEmail('')
            setPhoneNumber('')
        } catch (err) {
            setError(err instanceof  Error ? err : new Error('Nie udało się dodać klienta'))
        }
    }



  return (
      <main>
        <h1>Car Service Manager</h1>
        <p>Panel zarządzania warsztatem samochodowym</p>
          {loading && <p>Ładowanie klientów...</p>}
            {error && <p>Błąd: {error.message}</p>}
          {!loading && !error && (
              <ul>
                  {customers.map(c => (
                      <li key={c.id}>{c.firstName} {c.lastName}</li>
                  ))}
              </ul>
          )}

          <form onSubmit={handleSumbit}>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Imię" />
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nazwisko" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
              <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Numer telefonu" />
              <button type="submit">Dodaj klienta</button>
          </form>

      </main>
  )
}
export default App