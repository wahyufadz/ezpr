import { json, type RequestHandler } from '@sveltejs/kit';
import { resetOrders } from '$lib/server/db.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json() as { date?: string };
		if (!body || !body.date) {
			return json({ error: 'Missing required field: date' }, { status: 400 });
		}

		resetOrders(body.date);
		return json({ ok: true });
	} catch (e) {
		console.error('Error resetting orders:', e);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
