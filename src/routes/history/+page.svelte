<script lang="ts">
	import { base } from '$app/paths';
	import { getOrderDates, loadOrders } from '$lib/utils/storage';
	import { generateCSV, downloadCSV, type PesananRow } from '$lib/utils/csv';

	let dates = $state<string[]>([]);
	let isLoading = $state(true);
	let selectedDate = $state('');
	let filterText = $state('');
	// Cache rows per date to avoid re-fetching
	let rowsCache = $state<Record<string, PesananRow[]>>({});

	const filteredDates = $derived(
		filterText
			? dates.filter(d => d.includes(filterText))
			: dates
	);

	// Load all dates on mount
	async function init() {
		try {
			dates = await getOrderDates();
		} catch (e) {
			console.warn('Gagal memuat riwayat:', e);
		}
		isLoading = false;
	}
	init();

	// Load rows for a date on demand
	async function toggleDate(date: string) {
		if (selectedDate === date) {
			selectedDate = '';
			return;
		}
		selectedDate = date;
		if (!rowsCache[date]) {
			try {
				rowsCache[date] = await loadOrders(date);
			} catch (e) {
				console.warn('Gagal memuat detail:', e);
				rowsCache[date] = [];
			}
		}
	}

	function getRows(date: string): PesananRow[] {
		return rowsCache[date] || [];
	}
</script>

<div class="app">
	<header class="header">
		<a href="{base}/tempe/pesanan" class="back">← Kembali</a>
		<h1>Riwayat Pesanan</h1>
	</header>

	<main class="main">
		{#if isLoading}
			<div class="loading">⏳ Memuat riwayat...</div>
		{:else if dates.length === 0}
			<div class="empty">
				<p>Belum ada data pesanan.</p>
				<a href="{base}/tempe/pesanan" class="cta">Mulai Input Pesanan</a>
			</div>
		{:else}
			<input
				type="text"
				class="filter"
				placeholder="Cari tanggal (YYYY-MM-DD)..."
				bind:value={filterText}
			/>

			<div class="list">
				{#each filteredDates as date}
					{@const rows = getRows(date)}
					{@const totalQty = rows.reduce((sum, r) => sum + r.tempe_oranye + r.tempe_hijau + r.tempe_merah, 0)}
					{@const pesanCount = rows.filter(r => r.status === 'pesan').length}
					{@const liburCount = rows.filter(r => r.status === 'libur').length}
					<div
						class="history-card"
						class:expanded={selectedDate === date}
						onclick={() => toggleDate(date)}
						onkeydown={(e) => { if (e.key === 'Enter') toggleDate(date); }}
						role="button"
						tabindex="0"
					>
						<div class="history-summary">
							<div class="history-date">{date}</div>
							<div class="history-stats">
								<span>{rows.length} sales</span>
								<span>{totalQty} total</span>
							</div>
							<button
								class="download-small"
								onclick={(e: MouseEvent) => {
									e.stopPropagation();
									const csv = generateCSV(rows);
									downloadCSV(csv, `pesanan-tempe-${date}.csv`);
								}}
							>
								📥
							</button>
						</div>

						{#if selectedDate === date}
							<div class="history-detail">
								<div class="detail-header">
									<span>Pesan: {pesanCount}</span>
									<span>Libur: {liburCount}</span>
								</div>
								<table class="detail-table">
									<thead>
										<tr>
											<th>Sales</th>
											<th>🟠</th>
											<th>🟢</th>
											<th>🔴</th>
											<th>Total</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{#each rows as row}
											<tr>
												<td>{row.nama_sales}</td>
												<td>{row.tempe_oranye}</td>
												<td>{row.tempe_hijau}</td>
												<td>{row.tempe_merah}</td>
												<td class="total">{row.tempe_oranye + row.tempe_hijau + row.tempe_merah}</td>
												<td>
													{#if row.status === 'libur'}
														<span class="status-libur">Libur</span>
													{:else}
														<span class="status-pesan">Pesan</span>
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<style>
	.app {
		max-width: 480px;
		margin: 0 auto;
		padding: 1rem;
		min-height: 100vh;
	}

	.header {
		padding: 0.75rem 0;
	}

	.header h1 {
		font-size: 1.25rem;
		color: #ffffff;
		margin-top: 0.25rem;
	}

	.back {
		color: #888;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.main {
		padding: 1rem 0;
	}

	.loading {
		text-align: center;
		color: #888;
		padding: 3rem 1rem;
	}

	.empty {
		text-align: center;
		padding: 3rem 1rem;
		color: #888;
	}

	.cta {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.6rem 1.25rem;
		background: #4CAF50;
		color: #fff;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 700;
	}

	.filter {
		width: 100%;
		padding: 0.6rem 0.8rem;
		background: #1e1e1e;
		color: #e0e0e0;
		border: 1px solid #444;
		border-radius: 8px;
		font-size: 0.95rem;
		margin-bottom: 1rem;
	}

	.filter::placeholder {
		color: #666;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.history-card {
		background: #1e1e1e;
		border: 1px solid #333;
		border-radius: 10px;
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: background 0.15s;
	}

	.history-card:active {
		background: #2a2a2a;
	}

	.history-summary {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.history-date {
		font-weight: 700;
		color: #fff;
		font-size: 0.95rem;
		min-width: 90px;
	}

	.history-stats {
		flex: 1;
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #aaa;
	}

	.download-small {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.25rem;
	}

	.history-detail {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #333;
	}

	.detail-header {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #888;
		margin-bottom: 0.5rem;
	}

	.detail-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
	}

	.detail-table th {
		text-align: left;
		color: #888;
		padding: 0.4rem 0.3rem;
		border-bottom: 1px solid #333;
	}

	.detail-table td {
		padding: 0.4rem 0.3rem;
		color: #e0e0e0;
		border-bottom: 1px solid #2a2a2a;
	}

	.detail-table .total {
		font-weight: 700;
		color: #fff;
	}

	.status-libur {
		color: #F44336;
		font-weight: 600;
	}

	.status-pesan {
		color: #4CAF50;
		font-weight: 600;
	}
</style>
