// API client for server-side storage
import { browser } from '$app/environment';
import type { PesananRow } from './csv';

const API_BASE = '/ezpr/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...options,
	});
	if (!res.ok) {
		throw new Error(`API error: ${res.status} ${res.statusText}`);
	}
	return res.json() as Promise<T>;
}

/**
 * Save a single order to the server (upsert by tanggal + id_sales)
 */
export async function saveOrderApi(row: PesananRow): Promise<void> {
	if (!browser) return;
	await apiFetch('/save', {
		method: 'POST',
		body: JSON.stringify(row),
	});
}

/**
 * Load all orders for a given date from the server
 */
export async function loadOrdersApi(date: string): Promise<PesananRow[]> {
	if (!browser) return [];
	const data = await apiFetch<{ rows: PesananRow[] }>(`/load?date=${encodeURIComponent(date)}`);
	return data.rows;
}

/**
 * Clear all orders for a date
 */
export async function resetOrdersApi(date: string): Promise<void> {
	if (!browser) return;
	await apiFetch('/reset', {
		method: 'POST',
		body: JSON.stringify({ date }),
	});
}

/**
 * Get all dates that have orders
 */
export async function getOrderDatesApi(): Promise<string[]> {
	if (!browser) return [];
	const data = await apiFetch<{ dates: string[] }>('/dates');
	return data.dates;
}
