import { useState, useEffect } from 'react'
import { FaUsers, FaBox, FaChartLine, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

interface User {
  id: number
  first_name: string
  last_name: string
  company_name: string
  email: string
  phone: string
  is_admin: boolean
  created_at: string
}

interface Stats {
  total_users: number
  new_users: number
  admin_users: number
  total_shipments: number
  recent_shipments: number
  shipments_by_status: Record<string, number>
  users_by_month: Record<string, number>
}

interface Shipment {
  id: number;
  tracking_number: string;
  status: string;
  recipient_name: string;
  recipient_phone: string;
  designation: string;
  created_at: string;
  // Add more fields as needed
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('');
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    loadData();
    loadSettings();
    loadShipments(); // Ensure shipments are loaded on mount
  }, [])

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/stats')
      ])
      setUsers(usersData.data)
      setStats(statsData)
    } catch (e) {
      console.error('Failed to load admin data:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const settingsData = await apiFetch('/api/settings')
      const settingsObj: Record<string, string> = {}
      settingsData.forEach((s: any) => {
        settingsObj[s.key] = s.value
      })
      setSettings(settingsObj)
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  const loadShipments = async () => {
    try {
      const data = await apiFetch('/api/admin/shipments');
      setShipments(data.data);
    } catch (e) {
      console.error('Failed to load shipments:', e);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      setUsers(users.filter(u => u.id !== userId))
    } catch (e) {
      alert('Erreur lors de la suppression')
    }
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        await apiFetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(userData)
        })
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userData } : u))
      }
      setShowUserForm(false)
      setEditingUser(null)
    } catch (e) {
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEditShipment = (shipment: Shipment) => {
    setEditingShipment(shipment);
  };

  const handleUpdateShipment = async (shipmentId: number, updateData: Partial<Shipment>) => {
    try {
      await apiFetch(`/api/admin/shipments/${shipmentId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      loadShipments();
      setEditingShipment(null);
    } catch (e) {
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="container py-8">Chargement...</div>

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Administration</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Paramètres
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-4 py-2 rounded ${activeTab === 'shipments' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            Expéditions
          </button>
        </div>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <FaUsers className="text-2xl text-indigo-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{stats.total_users}</div>
                <div className="text-sm text-gray-600">Utilisateurs total</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <FaChartLine className="text-2xl text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{stats.new_users}</div>
                <div className="text-sm text-gray-600">Nouveaux (30j)</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <FaBox className="text-2xl text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{stats.total_shipments}</div>
                <div className="text-sm text-gray-600">Expéditions total</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <FaBox className="text-2xl text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{stats.recent_shipments}</div>
                <div className="text-sm text-gray-600">Récentes (30j)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setShowUserForm(true)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <FaPlus /> Nouvel utilisateur
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{user.first_name} {user.last_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_admin ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.is_admin ? 'Admin' : 'Marchand'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Paramètres d'expédition</h2>
          <form onSubmit={async (e) => {
            e.preventDefault()
            // Save all settings
            for (const key of Object.keys(settings)) {
              await apiFetch(`/api/settings/${key}`, {
                method: 'PUT',
                body: JSON.stringify({ value: settings[key] })
              })
            }
            alert('Paramètres sauvegardés')
          }} className="space-y-4">
            <div>
              <label className="block mb-1">Commission Rate</label>
              <input type="number" step="0.01" value={settings.commission_rate || ''} onChange={e => setSettings(s => ({ ...s, commission_rate: e.target.value }))} className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block mb-1">Shipping Fee</label>
              <input type="number" step="0.01" value={settings.shipping_fee || ''} onChange={e => setSettings(s => ({ ...s, shipping_fee: e.target.value }))} className="border rounded px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block mb-1">Barcode Prefix</label>
              <input type="text" value={settings.barcode_prefix || ''} onChange={e => setSettings(s => ({ ...s, barcode_prefix: e.target.value }))} className="border rounded px-3 py-2 w-full" />
            </div>
            <button type="submit" className="btn-primary">Sauvegarder</button>
          </form>
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="card">
          <div className="p-6 border-b flex gap-4 items-center">
            <h2 className="text-xl font-semibold">Gestion des expéditions</h2>
            <input
              type="text"
              placeholder="Rechercher par destinataire, tracking..."
              value={shipmentSearch}
              onChange={e => setShipmentSearch(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <select
              value={shipmentStatusFilter}
              onChange={e => setShipmentStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Tous statuts</option>
              <option value="created">Créé</option>
              <option value="pending">En attente</option>
              <option value="canceled">Annulé</option>
              <option value="returned">Retourné</option>
              <option value="delivered">Livré</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Tracking</th>
                  <th className="px-6 py-3">Destinataire</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Désignation</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments
                  .filter(s =>
                    (!shipmentSearch || s.recipient_name.toLowerCase().includes(shipmentSearch.toLowerCase()) || s.tracking_number.toLowerCase().includes(shipmentSearch.toLowerCase())) &&
                    (!shipmentStatusFilter || s.status === shipmentStatusFilter)
                  )
                  .map(s => (
                    <tr key={s.id}>
                      <td className="px-6 py-4">{s.tracking_number}</td>
                      <td className="px-6 py-4">{s.recipient_name}</td>
                      <td className="px-6 py-4">{s.status}</td>
                      <td className="px-6 py-4">{s.designation}</td>
                      <td className="px-6 py-4">{s.created_at}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleEditShipment(s)} className="btn-secondary mr-2">Edit</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {editingShipment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Modifier l'expédition</h3>
                <form onSubmit={e => {
                  e.preventDefault();
                  handleUpdateShipment(editingShipment.id, { status: (e.target as any).status.value });
                }}>
                  <div className="mb-4">
                    <label className="block mb-1">Statut</label>
                    <select name="status" defaultValue={editingShipment.status} className="border rounded px-3 py-2 w-full">
                      <option value="created">Créé</option>
                      <option value="pending">En attente</option>
                      <option value="canceled">Annulé</option>
                      <option value="returned">Retourné</option>
                      <option value="delivered">Livré</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">Sauvegarder</button>
                    <button type="button" onClick={() => setEditingShipment(null)} className="btn-secondary flex-1">Annuler</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {showUserForm && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowUserForm(false)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

const UserForm = ({ user, onSave, onCancel }: {
  user: User | null
  onSave: (data: Partial<User>) => void
  onCancel: () => void
}) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    company_name: user?.company_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    is_admin: user?.is_admin || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Prénom"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Nom"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Nom de l'entreprise"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="tel"
            placeholder="Téléphone (+216XXXXXXXX)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_admin}
              onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
              className="mr-2"
            />
            Administrateur
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">
              Sauvegarder
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Admin
