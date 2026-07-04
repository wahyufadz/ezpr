// Simple HTTP API server for tempe orders
// Runs alongside LiteSpeed, handles /api/* endpoints
const http = require('http');
const { saveOrder, loadOrders, resetOrders, getDates } = require('./db.cjs');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Parse JSON body from request
function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return resolve(null);
    }
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString();
        resolve(raw ? JSON.parse(raw) : null);
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Parse URL query parameters
function parseQuery(url) {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const qs = url.slice(idx + 1);
  const params = {};
  for (const part of qs.split('&')) {
    const [key, val] = part.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(val || '');
  }
  return params;
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function error(res, status, message) {
  json(res, status, { error: message });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // POST /api/save — save single order
    if (pathname === '/api/save' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body || !body.tanggal || !body.id_sales) {
        return error(res, 400, 'Missing required fields: tanggal, id_sales');
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

      return json(res, 200, { ok: true });
    }

    // GET /api/load?date=YYYY-MM-DD — load orders for date
    if (pathname === '/api/load' && req.method === 'GET') {
      const params = parseQuery(req.url);
      const date = params.date;
      if (!date) {
        return error(res, 400, 'Missing required query param: date');
      }

      const rows = loadOrders(date);
      return json(res, 200, { rows });
    }

    // POST /api/reset — clear orders for date
    if (pathname === '/api/reset' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body || !body.date) {
        return error(res, 400, 'Missing required field: date');
      }

      resetOrders(body.date);
      return json(res, 200, { ok: true });
    }

    // GET /api/dates — list all dates with orders
    if (pathname === '/api/dates' && req.method === 'GET') {
      const dates = getDates();
      return json(res, 200, { dates });
    }

    // 404
    error(res, 404, 'Not found');
  } catch (e) {
    console.error('Error handling request:', e);
    error(res, 500, 'Internal server error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Tempe API server running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
