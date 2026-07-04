// Storage helpers: form draft in localStorage, saved orders via API
import type { PesananRow } from './csv';
import { saveOrderApi, loadOrdersApi, resetOrdersApi, getOrderDatesApi } from './api';

const FORM_KEY_PREFIX = 'ezpr-form-';

export interface FormState {
	date: string; // YYYY-MM-DD
	sales: Record<string, {
		oranye: number;
		hijau: number;
		merah: number;
		libur: boolean;
		saved: boolean;
		savedAt?: string; // HH:MM
	}>;
}

// ─── Form draft (localStorage only — keystroke drafts) ───

function safeGet(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function safeSet(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

export function saveFormState(date: string, state: FormState): void {
	safeSet(FORM_KEY_PREFIX + date, JSON.stringify(state));
}

export function loadFormState(date: string): FormState | null {
	const raw = safeGet(FORM_KEY_PREFIX + date);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && parsed.sales) return parsed as FormState;
		return null;
	} catch {
		return null;
	}
}

// ─── Saved orders (server API) ───

/**
 * Save a single order to the server.
 * Upserts by tanggal+id_sales — safe for concurrent saves.
 */
export async function saveOrder(row: PesananRow): Promise<void> {
	return saveOrderApi(row);
}

/**
 * Load all saved orders for a date from the server.
 */
export async function loadOrders(date: string): Promise<PesananRow[]> {
	return loadOrdersApi(date);
}

/**
 * Clear all orders for a date.
 */
export async function resetOrders(date: string): Promise<void> {
	return resetOrdersApi(date);
}

/**
 * Get all dates that have orders.
 */
export async function getOrderDates(): Promise<string[]> {
	return getOrderDatesApi();
}
