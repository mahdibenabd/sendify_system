import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const Login = () => {
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
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
      })
      localStorage.setItem('token', data.token)
      navigate('/dashboard') // Redirect to dashboard after login
    } catch (e: any) {
      setErr(e.message || 'Erreur de connexion')
    }
  }
  
  return (
    <section className="container min-h-[80vh] grid lg:grid-cols-2 gap-8 py-12">
      <div className="hidden lg:flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-3">Bienvenue</h1>
        <p className="text-gray-600">Accédez à votre tableau de bord, créez des expéditions et suivez vos colis en temps réel.</p>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md card p-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">Se connecter</h2>
          {err && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              {err}
            </div>
          )}
          <form className="space-y-3" onSubmit={onSubmit}>
            <input name="email" type="email" placeholder="Email" className="w-full border rounded px-3 py-2" required />
            <input name="password" type="password" placeholder="Mot de passe" className="w-full border rounded px-3 py-2" required />
            <button className="btn-primary w-full">Se connecter</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login


