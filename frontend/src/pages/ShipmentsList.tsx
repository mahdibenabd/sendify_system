import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { FaEye, FaPrint } from 'react-icons/fa';

const ShipmentsList: React.FC = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewShipment, setViewShipment] = useState<any | null>(null);

  useEffect(() => {
    apiFetch('/api/shipments').then((data) => {
      setShipments(data.data || data);
      setLoading(false);
    });
  }, []);

  const handleView = (shipment: any) => {
    setViewShipment(shipment);
  };

  const handlePrint = async (shipment: any) => {
    // Open the PDF label in a new tab
    window.open(`http://localhost:8000/api/shipments/${shipment.id}/label?format=pdf`, '_blank');

    // Log print action to backend (optional)
    try {
      await apiFetch(`/api/shipments/${shipment.id}/log-print`, {
        method: 'POST',
        body: JSON.stringify({ printed_at: new Date().toISOString() }),
        headers: { 'Content-Type': 'application/json' },
      });
      // Optionally show a toast or message
      // alert('Impression enregistrée');
    } catch (e) {
      // Optionally handle/log error
      // alert('Erreur lors de l\'enregistrement de l\'impression');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Liste des expéditions</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Désignation</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total (TND)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-gray-100 transition">
                  <td className="px-4 py-2 whitespace-nowrap">{s.id}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{s.label}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{s.tracking_number || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{s.designation || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${s.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{s.status || '-'}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{s.total_price || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button className="btn-secondary" title="Voir" onClick={() => handleView(s)}><FaEye /></button>
                    <button className="btn-primary" title="Imprimer PDF" onClick={() => handlePrint(s)}><FaPrint /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Détails de l'expédition</h3>
            <div className="space-y-2">
              <div><strong>ID:</strong> {viewShipment.id}</div>
              <div><strong>Label:</strong> {viewShipment.label}</div>
              <div><strong>Tracking:</strong> {viewShipment.tracking_number || '-'}</div>
              <div><strong>Désignation:</strong> {viewShipment.designation || '-'}</div>
              <div><strong>Status:</strong> {viewShipment.status || '-'}</div>
              <div><strong>Total:</strong> {viewShipment.total_price || '-'} TND</div>
              <div><strong>Client:</strong> {viewShipment.recipient_name} ({viewShipment.recipient_phone})</div>
              <div><strong>Adresse:</strong> {viewShipment.address_line1} {viewShipment.address_line2} {viewShipment.city} {viewShipment.delegation} {viewShipment.governorate} {viewShipment.postal_code}</div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-primary flex-1" onClick={() => handlePrint(viewShipment)}><FaPrint /> Imprimer PDF</button>
              <button className="btn-secondary flex-1" onClick={() => setViewShipment(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsList;
