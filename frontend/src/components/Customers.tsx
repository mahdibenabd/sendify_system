import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { getGovernorates, getDelegations, getLocalities } from '../lib/locationApi';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  governorate: string;
  delegation: string;
  localite: string;
  postal_code: string;
  score?: number;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Location dropdowns
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [delegations, setDelegations] = useState<string[]>([]);
  const [localities, setLocalities] = useState<{ localite: string; cp: string }[]>([]);

  useEffect(() => {
    loadCustomers();
    loadGovernorates();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/customers');
      setCustomers(data);
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadGovernorates = async () => {
    try {
      const data = await getGovernorates();
      setGovernorates(data);
    } catch {}
  };

  const handleGovernorateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const governorate = e.target.value;
    setForm({ ...form, governorate, delegation: '', localite: '', postal_code: '' });
    setDelegations([]);
    setLocalities([]);
    if (governorate) {
      const data = await getDelegations(governorate);
      setDelegations(data);
    }
  };

  const handleDelegationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const delegation = e.target.value;
    setForm({ ...form, delegation, localite: '', postal_code: '' });
    setLocalities([]);
    if (form.governorate && delegation) {
      const data = await getLocalities(form.governorate, delegation);
      setLocalities(data);
    }
  };

  const handleLocaliteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const localite = e.target.value;
    const found = localities.find(l => l.localite === localite);
    const cp = found ? found.cp : '';
    setForm({ ...form, localite, postal_code: cp });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await apiFetch(`/api/customers/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
      } else {
        await apiFetch('/api/customers', {
          method: 'POST',
          body: JSON.stringify(form)
        });
      }
      setForm({});
      setEditingId(null);
      loadCustomers();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  const fetchGlobalHistory = async (name: string, phone: string) => {
    try {
      const res = await apiFetch(`/api/customers/global-history?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
      return res;
    } catch {
      return { score: 100, name, phone, id: null };
    }
  };

  const handleEdit = async (customer: Customer) => {
    setForm(customer);
    setEditingId(customer.id);
    // Preload delegations and localities for edit
    getDelegations(customer.governorate).then(setDelegations);
    getLocalities(customer.governorate, customer.delegation).then(setLocalities);
    // Show intelligent history from backend
    const history = await fetchGlobalHistory(customer.name, customer.phone);
    if (history && history.id && history.id !== customer.id) {
      alert(`Historique global: Score ${history.score ?? 'Neutre'} | Nom: ${history.name} | Téléphone: ${history.phone}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await apiFetch(`/api/customers/${id}`, { method: 'DELETE' });
      loadCustomers();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  // Intelligent global score: find best match by phone or normalized name
  function getIntelligentScore(current: Partial<Customer>) {
    const normalizedName = current.name?.trim().toLowerCase();
    const byPhone = customers.find(c => c.phone === current.phone);
    if (byPhone) return byPhone.score;
    const byName = customers.find(c => c.name.trim().toLowerCase() === normalizedName);
    if (byName) return byName.score;
    return current.score;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Clients</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input name="name" value={form.name || ''} onChange={handleChange} placeholder="Nom" className="border px-3 py-2 rounded" required />
        <input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="Téléphone" className="border px-3 py-2 rounded" required />
        <input name="email" value={form.email || ''} onChange={handleChange} placeholder="Email (optionnel)" className="border px-3 py-2 rounded" />
        <input name="address" value={form.address || ''} onChange={handleChange} placeholder="Adresse" className="border px-3 py-2 rounded" required />
        <select name="governorate" value={form.governorate || ''} onChange={handleGovernorateChange} className="border px-3 py-2 rounded" required>
          <option value="">Gouvernorat</option>
          {governorates.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select name="delegation" value={form.delegation || ''} onChange={handleDelegationChange} className="border px-3 py-2 rounded" required disabled={!form.governorate}>
          <option value="">Délégation</option>
          {delegations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select name="localite" value={form.localite || ''} onChange={handleLocaliteChange} className="border px-3 py-2 rounded" required disabled={!form.delegation}>
          <option value="">Localité</option>
          {localities.map(l => <option key={l.localite + l.cp} value={l.localite}>{l.localite} ({l.cp})</option>)}
        </select>
        <input name="postal_code" value={form.postal_code || ''} onChange={handleChange} placeholder="Code postal" className="border px-3 py-2 rounded" required readOnly />
        <button type="submit" className="btn-primary col-span-2" disabled={saving}>{saving ? (editingId ? 'Modification...' : 'Ajout...') : (editingId ? 'Modifier' : 'Ajouter')}</button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        {loading ? (
          <div>Chargement...</div>
        ) : customers.length === 0 ? (
          <div className="text-gray-500">Aucun client enregistré.</div>
        ) : (
          customers.map(cust => {
            const scoreDisplay = getIntelligentScore(cust);
            let scoreColor = 'text-blue-600';
            let scoreText = 'Neutre';
            const scoreNum = Number(scoreDisplay);
            if (!isNaN(scoreNum) && scoreDisplay !== null && scoreDisplay !== undefined) {
              scoreText = `${scoreNum} / 100`;
              if (scoreNum >= 80) scoreColor = 'text-green-600';
              else if (scoreNum >= 50) scoreColor = 'text-yellow-600';
              else scoreColor = 'text-red-600';
            }
            return (
              <div key={cust.id} className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold">{cust.name}</div>
                  <div>{cust.address}, {cust.localite} {cust.postal_code}</div>
                  <div className="text-sm text-gray-600">{cust.phone} {cust.email && <>| {cust.email}</>} | <span className={`font-bold ${scoreColor}`}>Score: {scoreText}</span></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(cust)} className="btn-secondary">Modifier</button>
                  <button onClick={() => handleDelete(cust.id)} className="btn-danger">Supprimer</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Customers;
