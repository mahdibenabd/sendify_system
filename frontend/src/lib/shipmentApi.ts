import { apiFetch } from './api';

export async function fetchPickupAddresses() {
  return apiFetch('/api/pickup-addresses');
}

export async function fetchCustomers() {
  return apiFetch('/api/customers');
}
