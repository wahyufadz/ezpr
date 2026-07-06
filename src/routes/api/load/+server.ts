import { json, type RequestHandler } from '@sveltejs/kit';
import { loadOrders } from '$lib/server/db.js';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const date = url.searchParams.get('date');
		if (!date) {
			return json({ error: 'Missing required query param: date' }, { status: 400 });
		}

		const rows = loadOrders(date);
		return json({ rows });
	} catch (e) {
		console.error('Error loading orders:', e);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
