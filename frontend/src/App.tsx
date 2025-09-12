import { Link, Outlet } from 'react-router-dom'
import { FaBoxes, FaUserShield } from 'react-icons/fa'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user, logout } = useAuth()
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold flex items-center gap-2 text-indigo-700">
            <FaBoxes /> Sendify
          </Link>
          <nav className="flex gap-4 text-sm items-center">
            {user ? (
              <>
                <Link className="hover:text-indigo-700" to="/dashboard">Dashboard</Link>
                {user.is_admin && (
                  <Link className="hover:text-indigo-700" to="/admin">
                    <span className="inline-flex items-center gap-1">
                      <FaUserShield /> Admin
                    </span>
                  </Link>
                )}
                <button className="btn-secondary" onClick={logout}>Se déconnecter</button>
              </>
            ) : (
              <>
                <Link className="btn-secondary" to="/login">Se connecter</Link>
                <Link className="btn-primary" to="/register">Créer un compte</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t text-center text-xs py-4 text-gray-500">© {new Date().getFullYear()} Sendify</footer>
    </div>
  )
}

export default App
