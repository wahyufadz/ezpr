// SQLite database for tempe orders
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'orders.db');

// Ensure data directory exists
const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

// Create tables
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

// Prepared statements
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

/**
 * Save a single order (upsert by tanggal + id_sales)
 */
function saveOrder(row) {
  stmtSave.run({
    tanggal: row.tanggal,
    id_sales: row.id_sales,
    nama_sales: row.nama_sales,
    tempe_oranye: row.tempe_oranye,
    tempe_hijau: row.tempe_hijau,
    tempe_merah: row.tempe_merah,
    status: row.status,
    saved_at: row.tanggal // tanggal already includes HH:MM
  });
}

/**
 * Load all orders for a given date (YYYY-MM-DD)
 */
function loadOrders(date) {
  return stmtLoad.all(`${date}%`);
}

/**
 * Clear all orders for a given date (YYYY-MM-DD)
 */
function resetOrders(date) {
  stmtReset.run(`${date}%`);
}

/**
 * Get all distinct dates that have orders
 */
function getDates() {
  return stmtDates.all().map(r => r.date);
}

module.exports = { saveOrder, loadOrders, resetOrders, getDates, db };
