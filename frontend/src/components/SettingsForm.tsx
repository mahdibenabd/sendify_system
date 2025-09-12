import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface Setting {
  id: number;
  key: string;
  value: string;
}

const SettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/settings')
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setSettings(arr);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(settings.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value })
      });
    } catch {
      setError('Failed to save setting');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mr-2"><path d="M12 6V3m0 3a6 6 0 0 1 6 6c0 2.21-1.2 4.15-3 5.19V21m-6-9a6 6 0 0 1 6-6m-6 6c0 2.21 1.2 4.15 3 5.19V21"/></svg>
        Paramètres du système
      </h2>
      {settings.length === 0 ? (
        <div className="text-gray-500">Aucun paramètre à afficher.</div>
      ) : (
        <form className="space-y-6">
          {settings.map(setting => (
            <div key={setting.key} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 bg-gray-50 p-4 rounded border">
              <label className="block font-semibold text-gray-700 md:w-1/3">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
              <input
                type="text"
                value={setting.value}
                onChange={e => handleChange(setting.key, e.target.value)}
                className="border px-3 py-2 rounded w-full md:w-2/3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => handleSave(setting.key, setting.value)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
                disabled={saving}
              >
                Enregistrer
              </button>
            </div>
          ))}
        </form>
      )}
      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default SettingsForm;
