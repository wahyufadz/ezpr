import { json, type RequestHandler } from '@sveltejs/kit';
import { saveOrder } from '$lib/server/db.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json() as {
			tanggal?: string;
			id_sales?: string;
			nama_sales?: string;
			tempe_oranye?: number;
			tempe_hijau?: number;
			tempe_merah?: number;
			status?: 'pesan' | 'libur';
		};

		if (!body || !body.tanggal || !body.id_sales) {
			return json({ error: 'Missing required fields: tanggal, id_sales' }, { status: 400 });
		}

		saveOrder({
			tanggal: body.tanggal,
			id_sales: body.id_sales,
			nama_sales: body.nama_sales || '',
			tempe_oranye: body.tempe_oranye || 0,
			tempe_hijau: body.tempe_hijau || 0,
			tempe_merah: body.tempe_merah || 0,
			status: body.status || 'pesan'
		});

		return json({ ok: true });
	} catch (e) {
		console.error('Error saving order:', e);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
