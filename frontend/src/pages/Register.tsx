import { useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [err, setErr] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()
  if (user) {
    navigate('/dashboard')
    return null
  }
  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          company_name: form.get('company_name'),
          first_name: form.get('first_name'),
          last_name: form.get('last_name'),
          phone: `+216${form.get('phone')}`,
          email: form.get('email'),
          password: form.get('password')
        })
      })
      localStorage.setItem('token', data.token)
      location.reload() // Reload to update auth context
    } catch (e: any) {
      setErr(e.message || 'Erreur')
    }
  }
  
  return (
    <section className="container min-h-[80vh] grid lg:grid-cols-2 gap-8 py-12">
      <div className="hidden lg:flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-3">Créer votre compte</h1>
        <p className="text-gray-600">Rejoignez Sendify et bénéficiez d'une intégration rapide avec Aramex et Tunisia Express.</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md card p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">Créer un compte</h2>
          {err && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              {err}
            </div>
          )}
          <form className="space-y-3" onSubmit={onSubmit}>
            <input name="company_name" placeholder="Nom de l'entreprise" className="w-full border rounded px-3 py-2" required />
            <div className="grid grid-cols-2 gap-3">
              <input name="first_name" placeholder="Prénom" className="w-full border rounded px-3 py-2" required />
              <input name="last_name" placeholder="Nom" className="w-full border rounded px-3 py-2" required />
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 border rounded px-3 py-2 bg-gray-50 text-gray-600"><span className="fi fi-tn" /> +216</span>
              <input name="phone" placeholder="XXXXXXXX" pattern="\d{8}" title="8 chiffres" className="w-full border rounded px-3 py-2" required />
            </div>
            <input name="email" type="email" placeholder="Email" className="w-full border rounded px-3 py-2" required />
            <input name="password" type="password" placeholder="Mot de passe" className="w-full border rounded px-3 py-2" required />
            <button className="btn-primary text-sm w-full">Créer</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Register

