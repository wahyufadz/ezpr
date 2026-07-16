// SQLite database for tempe orders
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { PesananRow } from '$lib/utils/csv';

const DB_PATH = path.join(process.cwd(), 'data', 'orders.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT NOT NULL,
    id_sales TEXT NOT NULL,
    nama_sales TEXT NOT NULL,
    tempe_oranye INTEGER DEFAULT 0,
    tempe_hijau INTEGER DEFAULT 0,
    tempe_merah INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('pesan', 'libur')) DEFAULT 'pesan',
    saved_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE(tanggal, id_sales)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_tanggal ON orders(tanggal);
`);

interface OrderSaveInput {
	tanggal: string;
	id_sales: string;
	nama_sales: string;
	tempe_oranye: number;
	tempe_hijau: number;
	tempe_merah: number;
	status: 'pesan' | 'libur';
}

interface OrderRow {
	tanggal: string;
	id_sales: string;
	nama_sales: string;
	tempe_oranye: number;
	tempe_hijau: number;
	tempe_merah: number;
	status: 'pesan' | 'libur';
}

const stmtSave = db.prepare(`
  INSERT INTO orders (tanggal, id_sales, nama_sales, tempe_oranye, tempe_hijau, tempe_merah, status, saved_at)
  VALUES (@tanggal, @id_sales, @nama_sales, @tempe_oranye, @tempe_hijau, @tempe_merah, @status, @saved_at)
  ON CONFLICT(tanggal, id_sales) DO UPDATE SET
    nama_sales = @nama_sales,
    tempe_oranye = @tempe_oranye,
    tempe_hijau = @tempe_hijau,
    tempe_merah = @tempe_merah,
    status = @status,
    saved_at = @saved_at
`);

const stmtLoad = db.prepare(`
  SELECT tanggal, id_sales, nama_sales, tempe_oranye, tempe_hijau, tempe_merah, status
  FROM orders
  WHERE tanggal LIKE ?
  ORDER BY nama_sales ASC
`);

const stmtReset = db.prepare(`DELETE FROM orders WHERE tanggal LIKE ?`);
const stmtDates = db.prepare(`
  SELECT DISTINCT substr(tanggal, 1, 10) as date
  FROM orders
  ORDER BY date DESC
`);

export function saveOrder(row: OrderSaveInput): void {
	stmtSave.run({
		tanggal: row.tanggal,
		id_sales: row.id_sales,
		nama_sales: row.nama_sales || '',
		tempe_oranye: row.tempe_oranye || 0,
		tempe_hijau: row.tempe_hijau || 0,
		tempe_merah: row.tempe_merah || 0,
		status: row.status || 'pesan',
		saved_at: row.tanggal
	});
}

export function loadOrders(date: string): OrderRow[] {
	return stmtLoad.all(`${date}%`) as OrderRow[];
}

export function resetOrders(date: string): void {
	stmtReset.run(`${date}%`);
}

export function getDates(): string[] {
	const rows = stmtDates.all() as { date: string }[];
	return rows.map(r => r.date);
}
