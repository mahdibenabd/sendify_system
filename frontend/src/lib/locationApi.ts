import { apiFetch } from './api';

export async function getGovernorates() {
  return await apiFetch('/api/locations/governorates');
}

export async function getDelegations(governorate: string) {
  return await apiFetch(`/api/locations/delegations?governorate=${encodeURIComponent(governorate)}`);
}

export async function getLocalities(governorate: string, delegation: string) {
  return await apiFetch(`/api/locations/localities?governorate=${encodeURIComponent(governorate)}&delegation=${encodeURIComponent(delegation)}`);
}
