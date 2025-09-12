import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const TrackShipment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('tracking') || '');
  const [shipment, setShipment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShipment(null);
    try {
      const data = await apiFetch(`/api/track/${trackingNumber}`);
      setShipment(data);
    } catch (err: any) {
      setError(err.message || 'Expédition non trouvée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Suivi d'expédition</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={trackingNumber}
          onChange={e => setTrackingNumber(e.target.value)}
          placeholder="Numéro de suivi"
          className="border rounded px-3 py-2 flex-1"
          required
        />
        <button type="submit" className="btn-primary">Rechercher</button>
      </form>
      {loading && <div>Chargement...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {shipment && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-2">Informations d'expédition</h3>
          <div><strong>Numéro de suivi:</strong> {shipment.tracking_number}</div>
          <div><strong>Désignation:</strong> {shipment.designation}</div>
          <div><strong>Status:</strong> {shipment.status}</div>
          <div><strong>Destinataire:</strong> {shipment.recipient_name} ({shipment.recipient_phone})</div>
          <div><strong>Adresse:</strong> {shipment.address}</div>
          <div><strong>Date:</strong> {shipment.created_at}</div>
          <div className="mt-4 text-center">
            <div className="text-xs mt-2">QR code pour cette expédition</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipment;
