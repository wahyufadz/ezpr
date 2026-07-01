// CSV generation & parsing for pesanan tempe

export interface PesananRow {
	tanggal: string;
	id_sales: string;
	nama_sales: string;
	tempe_oranye: number;
	tempe_hijau: number;
	tempe_merah: number;
	total: number;
	status: 'pesan' | 'libur';
}

const CSV_HEADER = 'tanggal,id_sales,nama_sales,tempe_oranye,tempe_hijau,tempe_merah,total,status';

export function generateCSV(rows: PesananRow[]): string {
	const lines = [CSV_HEADER];
	for (const r of rows) {
		lines.push(
			[r.tanggal, r.id_sales, r.nama_sales, r.tempe_oranye, r.tempe_hijau, r.tempe_merah, r.total, r.status].join(',')
		);
	}
	return lines.join('\n');
}

export function parseCSV(text: string): PesananRow[] {
	const lines = text.trim().split('\n');
	if (lines[0]?.startsWith('tanggal')) lines.shift(); // skip header
	const rows: PesananRow[] = [];
	for (const line of lines) {
		const parts = line.split(',');
		if (parts.length < 8) continue;
		rows.push({
			tanggal: parts[0].trim(),
			id_sales: parts[1].trim(),
			nama_sales: parts[2].trim(),
			tempe_oranye: parseInt(parts[3], 10) || 0,
			tempe_hijau: parseInt(parts[4], 10) || 0,
			tempe_merah: parseInt(parts[5], 10) || 0,
			total: parseInt(parts[6], 10) || 0,
			status: parts[7].trim() === 'libur' ? 'libur' : 'pesan'
		});
	}
	return rows;
}

export function downloadCSV(csv: string, filename: string) {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
