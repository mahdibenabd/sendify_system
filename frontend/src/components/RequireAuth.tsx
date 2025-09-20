import { useAuth } from '../contexts/AuthContext'


interface RequireAuthProps {
  children: React.ReactNode;
  role?: string | string[];
}


const RequireAuth = ({ children, role }: RequireAuthProps) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="container py-8">Chargement...</div>;
  if (!user) {
    location.href = '/login';
    return null;
  }
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    // Accept both 'role' and legacy 'is_admin' for backward compatibility
    const userRole = user.role || (user.is_admin ? 'admin' : 'merchant');
    if (!roles.includes(userRole)) {
      // Optionally redirect or show forbidden
      return <div className="container py-8 text-red-600">Accès refusé</div>;
    }
  }
  return children as any;
};

export default RequireAuth