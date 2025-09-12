import { useAuth } from '../contexts/AuthContext'

interface RequireAuthProps {
  children: React.ReactNode
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="container py-8">Chargement...</div>
  if (!user) { 
    location.href = '/login'
    return null 
  }
  return children as any
}

export default RequireAuth