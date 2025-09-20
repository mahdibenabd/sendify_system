import React, { useState, useEffect } from 'react';
import { fetchPickupAddresses, fetchCustomers } from '../lib/shipmentApi';
import { apiFetch } from '../lib/api';
import { getGovernorates, getDelegations, getLocalities } from '../lib/locationApi';

const CreateShipment: React.FC = () => {
  const [pickupAddresses, setPickupAddresses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [pickupAddressId, setPickupAddressId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [goodsPrice, setGoodsPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const [labelUrl, setLabelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState<any>({});
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [delegations, setDelegations] = useState<string[]>([]);
  const [localities, setLocalities] = useState<{ localite: string; cp: string }[]>([]);

  useEffect(() => {
    fetchPickupAddresses().then(setPickupAddresses);
    fetchCustomers().then(setCustomers);
    loadSettings();
    loadGovernorates();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await apiFetch('/api/settings');
      const settingsObj: Record<string, string> = {};
      settingsData.forEach((s: any) => {
        settingsObj[s.key] = s.value;
      });
      setSettings(settingsObj);
    } catch (e) {
      // handle error
    }
  };

  const loadGovernorates = async () => {
    try {
      const data = await getGovernorates();
      setGovernorates(data);
    } catch {}
  };

  useEffect(() => {
    const commission = parseFloat(settings.commission_rate || '0');
    const shipmentPrice = parseFloat(settings.shipping_fee || '0');
    const price = parseFloat(goodsPrice || '0') + shipmentPrice + commission;
    setTotalPrice(price);
  }, [goodsPrice, settings]);

  const handleGovernorateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const governorate = e.target.value;
    setForm({ ...form, new_customer_governorate: governorate, new_customer_delegation: '', new_customer_localite: '', new_customer_postal_code: '' });
    setDelegations([]);
    setLocalities([]);
    if (governorate) {
      const data = await getDelegations(governorate);
      setDelegations(data);
    }
  };

  const handleDelegationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const delegation = e.target.value;
    setForm({ ...form, new_customer_delegation: delegation, new_customer_localite: '', new_customer_postal_code: '' });
    setLocalities([]);
    if (form.new_customer_governorate && delegation) {
      const data = await getLocalities(form.new_customer_governorate, delegation);
      setLocalities(data);
    }
  };

  const handleLocaliteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const localite = e.target.value;
    const found = localities.find(l => l.localite === localite);
    const cp = found ? found.cp : '';
    setForm({ ...form, new_customer_localite: localite, new_customer_postal_code: cp });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      let payload: any = {
        pickup_address_id: pickupAddressId,
        customer_id: customerId || undefined,
        designation,
        goods_price: goodsPrice,
      };
      if (!customerId) {
        payload = {
          ...payload,
          new_customer_name: newCustomerName,
          new_customer_phone: newCustomerPhone,
          new_customer_email: form.new_customer_email,
          new_customer_address: form.new_customer_address,
          new_customer_governorate: form.new_customer_governorate,
          new_customer_delegation: form.new_customer_delegation,
          new_customer_localite: form.new_customer_localite,
          new_customer_postal_code: form.new_customer_postal_code,
        };
      }
      const res = await apiFetch('/api/shipments', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
      const shipment = res.shipment || res;
      setResult(shipment);
      if (shipment && shipment.id) {
        setLabelUrl(`http://localhost:8000/api/shipments/${shipment.id}/label?format=pdf`);
        setShowLabelPreview(true);
      }
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création');
    }
  };


  // Label preview modal
  const labelPreviewModal = showLabelPreview && labelUrl && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={() => setShowLabelPreview(false)}
        >✕</button>
        <h3 className="text-lg font-semibold mb-4">Aperçu de l'étiquette</h3>
        <iframe
          src={labelUrl}
          title="Aperçu de l'étiquette"
          className="w-full h-[600px] border rounded"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Créer une expédition</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
        <div>
          <label className="block mb-1">Adresse de ramassage</label>
          <select value={pickupAddressId} onChange={e => setPickupAddressId(e.target.value)} required className="w-full border rounded px-3 py-2">
            <option value="">Choisir...</option>
            {pickupAddresses.map(addr => (
              <option key={addr.id} value={addr.id}>{addr.label || addr.address}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Client</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Nouveau client</option>
            {customers.map(cust => (
              <option key={cust.id} value={cust.id}>{cust.name}</option>
            ))}
          </select>
        </div>
        {!customerId && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="new_customer_name"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                placeholder="Nom du nouveau client"
                className="border px-3 py-2 rounded"
                required
              />
              <input
                name="new_customer_phone"
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                placeholder="Téléphone du nouveau client"
                className="border px-3 py-2 rounded"
                required
              />
              <input
                name="new_customer_email"
                value={form.new_customer_email || ''}
                onChange={handleChange}
                placeholder="Email (optionnel)"
                className="border px-3 py-2 rounded"
              />
              <input
                name="new_customer_address"
                value={form.new_customer_address || ''}
                onChange={handleChange}
                placeholder="Adresse"
                className="border px-3 py-2 rounded"
                required
              />
              <select
                name="new_customer_governorate"
                value={form.new_customer_governorate || ''}
                onChange={handleGovernorateChange}
                className="border px-3 py-2 rounded"
                required
              >
                <option value="">Gouvernorat</option>
                {governorates.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select
                name="new_customer_delegation"
                value={form.new_customer_delegation || ''}
                onChange={handleDelegationChange}
                className="border px-3 py-2 rounded"
                required
                disabled={!form.new_customer_governorate}
              >
                <option value="">Délégation</option>
                {delegations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                name="new_customer_localite"
                value={form.new_customer_localite || ''}
                onChange={handleLocaliteChange}
                className="border px-3 py-2 rounded"
                required
                disabled={!form.new_customer_delegation}
              >
                <option value="">Localité</option>
                {localities.map(l => <option key={l.localite + l.cp} value={l.localite}>{l.localite} ({l.cp})</option>)}
              </select>
              <input
                name="new_customer_postal_code"
                value={form.new_customer_postal_code || ''}
                onChange={handleChange}
                placeholder="Code postal"
                className="border px-3 py-2 rounded"
                required
                readOnly
              />
            </div>
          </>
        )}
        <div>
          <label className="block mb-1">Désignation</label>
          <input value={designation} onChange={e => setDesignation(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block mb-1">Prix des marchandises (TND)</label>
          <input type="number" value={goodsPrice} onChange={e => setGoodsPrice(e.target.value)} className="w-full border rounded px-3 py-2" required min="0" />
        </div>
        <div className="pt-4">
          <strong>Total: {totalPrice.toFixed(3)} TND</strong>
        </div>
        <button type="submit" className="btn-primary mt-4">Créer l'expédition</button>
      </form>
      {labelPreviewModal}
    </div>
  );
};

export default CreateShipment;
