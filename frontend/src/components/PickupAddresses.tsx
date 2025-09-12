import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { getGovernorates, getDelegations, getLocalities } from '../lib/locationApi';

interface PickupAddress {
  id: number;
  label?: string;
  address: string;
  city: string;
  postal_code: string;
  contact_name: string;
  contact_phone: string;
  governorate?: string;
  delegation?: string;
  localite?: string;
}

const PickupAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<PickupAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<PickupAddress>>({});
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [delegations, setDelegations] = useState<string[]>([]);
  const [localities, setLocalities] = useState<{ localite: string; cp: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
    loadGovernorates();
  }, []);

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

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/pickup-addresses');
      setAddresses(data);
    } catch {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    // Ensure city is set (use delegation or localite as fallback)
    const submitForm = {
      ...form,
      city: form.city || form.delegation || form.localite || '',
    };
    try {
      await apiFetch('/api/pickup-addresses', {
        method: 'POST',
        body: JSON.stringify(submitForm)
      });
      setForm({});
      loadAddresses();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'ajout');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette adresse ?')) return;
    try {
      await apiFetch(`/api/pickup-addresses/${id}`, { method: 'DELETE' });
      loadAddresses();
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Adresses de ramassage</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input name="label" value={form.label || ''} onChange={handleChange} placeholder="Nom (Par ex : Depot soukra)" className="border px-3 py-2 rounded" />
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
        <input name="contact_name" value={form.contact_name || ''} onChange={handleChange} placeholder="Nom du contact" className="border px-3 py-2 rounded" required />
        <input name="contact_phone" value={form.contact_phone || ''} onChange={handleChange} placeholder="Téléphone du contact" className="border px-3 py-2 rounded" required />
        <button type="submit" className="btn-primary col-span-2" disabled={saving}>{saving ? 'Ajout...' : 'Ajouter'}</button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="space-y-4">
        {loading ? (
          <div>Chargement...</div>
        ) : addresses.length === 0 ? (
          <div className="text-gray-500">Aucune adresse enregistrée.</div>
        ) : (
          addresses.map(addr => (
            <div key={addr.id} className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="font-semibold">{addr.label || 'Adresse'}</div>
                <div>{addr.address}, {addr.city} {addr.postal_code}</div>
                <div className="text-sm text-gray-600">Contact: {addr.contact_name} ({addr.contact_phone})</div>
              </div>
              <button onClick={() => handleDelete(addr.id)} className="btn-secondary">Supprimer</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PickupAddresses;
