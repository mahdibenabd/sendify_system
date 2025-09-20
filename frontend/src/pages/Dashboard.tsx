import { useState, useEffect } from 'react'
import { FaPlus, FaHistory, FaUndo, FaChartLine, FaMoneyBill, FaCog, FaBox, FaMapMarkerAlt, FaUsers, FaBoxes } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'
import PickupAddresses from '../components/PickupAddresses'
import Customers from '../components/Customers'
import CreateShipment from './CreateShipment';
import ShipmentsList from './ShipmentsList';

const SettingsSection = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiFetch('/api/auth/me');
        setUser(data);
      } catch (e) {
        console.error('Failed to load user:', e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    try {
      const data = await apiFetch('/api/auth/update-profile', {
        method: 'POST',
        body: JSON.stringify({
          first_name: form.get('first_name'),
          last_name: form.get('last_name'),
          company_name: form.get('company_name'),
          phone: '+216' + form.get('phone'),
          email: form.get('email'),
        })
      });
      setUser(data.user);
      setMessage('Profil mis à jour avec succès');
    } catch (e: any) {
      setMessage(e.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Paramètres du profil</h2>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-3 rounded text-sm ${
              message.includes('succès')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input name="first_name" defaultValue={user?.first_name || ''} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input name="last_name" defaultValue={user?.last_name || ''} className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
            <input name="company_name" defaultValue={user?.company_name || ''} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 border rounded px-3 py-2 bg-gray-50 text-gray-600"><span className="fi fi-tn" /> +216</span>
              <input name="phone" defaultValue={user?.phone?.replace('+216', '') || ''} placeholder="XXXXXXXX" pattern="\d{8}" title="8 chiffres" className="w-full border rounded px-3 py-2" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" defaultValue={user?.email || ''} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button type="button" onClick={() => setMessage(null)} className="btn-secondary">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('7'); // days
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    if (activeSection === 'overview') {
      loadStats();
    }
  }, [activeSection, timeFilter]);

  useEffect(() => {
    setSidebarOpen(false); // Close sidebar automatically on page load
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/dashboard/stats?period=${timeFilter}`);
      setStats(data);
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: FaBox },
    { id: 'pickup_addresses', label: 'Adresses de ramassage', icon: FaMapMarkerAlt },
    { id: 'customers', label: 'Clients', icon: FaUsers },
    { id: 'new_shipment', label: 'Créer expédition', icon: FaPlus },
    { id: 'shipments_list', label: 'Liste des expéditions', icon: FaBox },
    { id: 'history', label: 'Historique', icon: FaHistory },
    { id: 'returns', label: 'Retours', icon: FaUndo },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'revenues', label: 'Revenus', icon: FaMoneyBill },
    { id: 'settings', label: 'Paramètres', icon: FaCog },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Vue d'ensemble</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Période:</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="1">Aujourd'hui</option>
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">3 derniers mois</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <div className="text-2xl font-bold text-indigo-600">
                  {loading ? '...' : (stats?.period_shipments || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  Expéditions {timeFilter === '1' ? 'aujourd\'hui' : `(${timeFilter}j)`}
                </div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : (stats?.delivered_shipments || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  Livrées {timeFilter === '1' ? 'aujourd\'hui' : `(${timeFilter}j)`}
                </div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : (stats?.in_transit_shipments || 0)}
                </div>
                <div className="text-sm text-gray-600">En transit</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-red-600">
                  {loading ? '...' : (stats?.returned_shipments || 0)}
                </div>
                <div className="text-sm text-gray-600">Retours</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Expéditions par statut</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">En transit</span>
                    <span className="font-medium">{loading ? '...' : (stats?.in_transit_shipments || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Livrées</span>
                    <span className="font-medium">{loading ? '...' : (stats?.delivered_shipments || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Retours</span>
                    <span className="font-medium">{loading ? '...' : (stats?.returned_shipments || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de livraison</span>
                    <span className="font-medium text-green-600">
                      {loading ? '...' : `${stats?.delivery_rate || 0}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Délai moyen</span>
                    <span className="font-medium">
                      {loading ? '...' : `${stats?.average_delivery_time || 0} jours`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Commission TND</span>
                    <span className="font-medium">
                      {loading ? '...' : `${(stats?.commission_earned || 0).toFixed(3)} TND`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Expéditions récentes</h3>
              <div className="text-gray-600">Aucune expédition récente</div>
            </div>
          </div>
        );
      case 'pickup_addresses':
        return <PickupAddresses />;
      case 'customers':
        return <Customers />;
      case 'create':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Créer une expédition</h2>
            <div className="card p-6">
              <div className="text-gray-600">Formulaire de création d'expédition à venir...</div>
            </div>
          </div>
        );
      case 'new_shipment':
        return <CreateShipment />;
      case 'shipments_list':
        return <ShipmentsList />;
      case 'history':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Historique des expéditions</h2>
            <div className="card p-6">
              <div className="text-gray-600">Liste des expéditions à venir...</div>
            </div>
          </div>
        );
      case 'returns':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Gestion des retours</h2>
            <div className="card p-6">
              <div className="text-gray-600">Tableau des retours à venir...</div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Analytics</h2>
            <div className="card p-6">
              <div className="text-gray-600">Graphiques et statistiques à venir...</div>
            </div>
          </div>
        );
      case 'revenues':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Revenus</h2>
            <div className="card p-6">
              <div className="text-gray-600">Tableau des revenus à venir...</div>
            </div>
          </div>
        );
      case 'settings':
        return <SettingsSection />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar toggle button - move to bottom left for better visibility */}
      <button
        className="fixed bottom-6 left-6 z-40 md:hidden bg-indigo-600 text-white rounded-full p-3 shadow"
        onClick={() => setSidebarOpen(true)}
        style={{ display: sidebarOpen ? 'none' : 'block' }}
      >
        <span className="text-xl">☰</span>
      </button>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-sm border-r flex flex-col min-h-screen transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
            <div className="p-8 border-b flex items-center justify-between">
              <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-0' : '-ml-64'} flex items-center`}>
                <span className="font-semibold flex items-center gap-2 text-indigo-700 text-xl">
                  <FaBoxes /> Sendify
                </span>
                <h1 className="text-lg font-semibold ml-3">Dashboard</h1>
              </div>
              <button className="md:hidden ml-2" onClick={() => setSidebarOpen(false)}>
                <span className="text-xl">×</span>
              </button>
            </div>
            <nav className="mt-8 flex-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false); // Close sidebar when menu item is clicked
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${
                      activeSection === item.id ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700' : 'text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="absolute bottom-8 left-4 right-4">
              <button
                className="w-full btn-secondary"
                onClick={logout}
              >
                Se déconnecter
              </button>
            </div>
          </div>
          {/* Main Content */}
          <div className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}> 
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
