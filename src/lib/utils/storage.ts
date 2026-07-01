// localStorage helpers — silent save & restore with corruption handling

import type { PesananRow } from './csv';

const FORM_KEY_PREFIX = 'ezpr-form-';
const CSV_KEY_PREFIX = 'ezpr-csv-';

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
		return null; // corrupted — silently reset
	}
}

export function saveCSVData(date: string, rows: PesananRow[]): void {
	safeSet(CSV_KEY_PREFIX + date, JSON.stringify(rows));
}

export function getCSVData(date: string): PesananRow[] {
	const raw = safeGet(CSV_KEY_PREFIX + date);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed as PesananRow[];
		return [];
	} catch {
		return [];
	}
}

export function getAllCSVDates(): string[] {
	const dates: string[] = [];
	try {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(CSV_KEY_PREFIX)) {
				dates.push(key.replace(CSV_KEY_PREFIX, ''));
			}
		}
	} catch {
		// localStorage not available — return empty
	}
	return dates.sort().reverse();
}
