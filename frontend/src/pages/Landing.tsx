import { FaTruckMoving, FaMapMarkedAlt, FaMoneyBillWave } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'

const Landing = () => {
  const { user } = useAuth()
  
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-indigo-100" />
        <div className="container relative py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Expédiez en Tunisie en toute simplicité
            </h1>
            <p className="text-gray-600 mb-6">
              Une seule interface pour Aramex et Tunisia Express. COD en TND, commission fixe, suivi en temps réel.
            </p>
            <div className="flex gap-3">
              {user ? (
                <a href="/dashboard" className="btn-primary text-sm">Accéder au dashboard</a>
              ) : (
                <>
                  <a href="/register" className="btn-primary text-sm">Commencer maintenant</a>
                  <a href="/login" className="btn-secondary text-sm">Déjà client</a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="container py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="text-indigo-600 mb-2"><FaTruckMoving /></div>
          <div className="text-sm text-gray-500">Agrégation transporteurs</div>
          <div className="text-lg font-semibold">Aramex & Tunisia Express</div>
        </div>
        <div className="card p-5">
          <div className="text-indigo-600 mb-2"><FaMapMarkedAlt /></div>
          <div className="text-sm text-gray-500">Réduction des retours</div>
          <div className="text-lg font-semibold">Validation d'adresse + notifications</div>
        </div>
        <div className="card p-5">
          <div className="text-indigo-600 mb-2"><FaMoneyBillWave /></div>
          <div className="text-sm text-gray-500">COD en TND</div>
          <div className="text-lg font-semibold">Commission fixe transparente</div>
        </div>
      </section>
      <div className="container py-6 text-center">
        <a href="/track" className="text-indigo-700 underline text-sm hover:text-indigo-900">
          Suivre une expédition
        </a>
      </div>
    </>
  )
}

export default Landing


