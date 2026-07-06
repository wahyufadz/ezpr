import { json, type RequestHandler } from '@sveltejs/kit';
import { getDates } from '$lib/server/db.js';

export const GET: RequestHandler = async () => {
	try {
		const dates = getDates();
		return json({ dates });
	} catch (e) {
		console.error('Error getting dates:', e);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
