<script lang="ts">
	import SalesCard from '$lib/components/SalesCard.svelte';
	import salesData from '$lib/data/sales.json';
	import { generateCSV, downloadCSV, type PesananRow } from '$lib/utils/csv';
	import { saveFormState, loadFormState, saveCSVData, getCSVData } from '$lib/utils/storage';

	const activeSales = salesData.sales.filter(s => s.active);

	// Get today's date in YYYY-MM-DD for Asia/Jakarta
	function getTodayStr(): string {
		const now = new Date();
		const jakarta = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
		const y = jakarta.getFullYear();
		const m = String(jakarta.getMonth() + 1).padStart(2, '0');
		const d = String(jakarta.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

	function formatDisplayDate(dateStr: string): string {
		const parts = dateStr.split('-');
		if (parts.length !== 3) return dateStr;
		const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
		return `${DAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
	}

	let selectedDate = $state(getTodayStr());
	let toast = $state('');
	let toastTimer = $state<ReturnType<typeof setTimeout> | null>(null);
	let showResetConfirm = $state(false);
	let resetInputText = $state('');
	const RESET_CONFIRM_WORD = 'RESET';
	let lastUpdated = $state('');

	// Per-sales state
	interface SalesState {
		oranye: number;
		hijau: number;
		merah: number;
		libur: boolean;
		saved: boolean;
		savedAt: string;
	}

	let salesState = $state<Record<string, SalesState>>({});
	let isRestoring = $state(true); // skip save during initial restore

	function initState() {
		const fresh: Record<string, SalesState> = {};
		for (const s of activeSales) {
			fresh[s.id] = { oranye: 0, hijau: 0, merah: 0, libur: false, saved: false, savedAt: '' };
		}
		return fresh;
	}

	// Try restore from localStorage
	const restored = loadFormState(selectedDate);
	if (restored && restored.date === selectedDate) {
		// Merge restored state with current sales list
		const merged: Record<string, SalesState> = {};
		for (const s of activeSales) {
			const r = restored.sales[s.id];
			merged[s.id] = r ? { ...r } : { oranye: 0, hijau: 0, merah: 0, libur: false, saved: false, savedAt: '' };
		}
		salesState = merged;
	} else {
		salesState = initState();
	}
	isRestoring = false;

	function saveFormToStorage() {
		if (isRestoring) return;
		saveFormState(selectedDate, { date: selectedDate, sales: { ...salesState } });
	}

	function updateSales(id: string, data: { oranye?: number; hijau?: number; merah?: number; libur?: boolean }) {
		const current = salesState[id];
		if (!current) return;
		salesState[id] = {
			...current,
			...data,
			saved: current.saved ? false : false,
			savedAt: ''
		};
		const now = new Date();
		lastUpdated = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
		saveFormToStorage();
	}

	function handleEdit(id: string) {
		const s = salesState[id];
		if (!s) return;
		salesState[id] = { ...s, saved: false, savedAt: '' };
		const now = new Date();
		lastUpdated = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
		saveFormToStorage();
	}

	function handleSave(id: string) {
		const s = salesState[id];
		const sales = activeSales.find(x => x.id === id);
		if (!sales || !s) return;

		const now = new Date();
		const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

		salesState[id] = {
			...s,
			saved: true,
			savedAt: time
		};

		lastUpdated = time;

		// Commit to CSV store
		const rows = getCSVData(selectedDate);
		const total = s.oranye + s.hijau + s.merah;
		const status = s.libur ? 'libur' : 'pesan';

		const row: PesananRow = {
			tanggal: selectedDate,
			id_sales: sales.id,
			nama_sales: sales.name,
			tempe_oranye: s.libur ? 0 : s.oranye,
			tempe_hijau: s.libur ? 0 : s.hijau,
			tempe_merah: s.libur ? 0 : s.merah,
			total: s.libur ? 0 : total,
			status
		};

		// Replace existing row for same sales+date
		const idx = rows.findIndex(r => r.id_sales === id);
		if (idx >= 0) rows[idx] = row;
		else rows.push(row);

		saveCSVData(selectedDate, rows);
		saveFormToStorage();
		showToast(`✅ ${sales.name} tersimpan`);
	}

	function handleDownload() {
		const rows = getCSVData(selectedDate);
		const csv = generateCSV(rows);
		downloadCSV(csv, `pesanan-tempe-${selectedDate}.csv`);
		showToast('📥 CSV didownload');
	}

	function handleDateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const newDate = target.value;
		// Save current date state first
		saveFormState(selectedDate, { date: selectedDate, sales: { ...salesState } });

		selectedDate = newDate;
		isRestoring = true;

		const restoredDate = loadFormState(newDate);
		if (restoredDate && restoredDate.date === newDate) {
			const merged: Record<string, SalesState> = {};
			for (const s of activeSales) {
				const r = restoredDate.sales[s.id];
				merged[s.id] = r ? { ...r } : { oranye: 0, hijau: 0, merah: 0, libur: false, saved: false, savedAt: '' };
			}
			salesState = merged;
		} else {
			salesState = initState();
		}
		isRestoring = false;
	}

	function handleReset() {
		resetInputText = '';
		showResetConfirm = true;
	}

	function confirmReset() {
		if (resetInputText !== RESET_CONFIRM_WORD) return;
		showResetConfirm = false;
		resetInputText = '';
		salesState = initState();
		saveCSVData(selectedDate, []);
		saveFormToStorage();
		showToast('🔄 Semua direset');
	}

	function showToast(msg: string) {
		toast = msg;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => { toast = ''; }, 2500);
	}

	const savedCount = $derived(Object.values(salesState).filter(s => s.saved).length);
	const totalCount = $derived(activeSales.length);

	// Sort: saved non-libur → libur → unsaved non-libur
	const sortedSales = $derived(
		[...activeSales].sort((a, b) => {
			const sa = salesState[a.id];
			const sb = salesState[b.id];
			if (!sa || !sb) return 0;

			const aOrder = sa.saved && !sa.libur ? 0 : sa.libur ? 1 : 2;
			const bOrder = sb.saved && !sb.libur ? 0 : sb.libur ? 1 : 2;
			return aOrder - bOrder;
		})
	);

	// Summary totals from saved non-libur sales
	const totalOranye = $derived(
		Object.values(salesState)
			.filter(s => s.saved && !s.libur)
			.reduce((sum, s) => sum + s.oranye, 0)
	);
	const totalHijau = $derived(
		Object.values(salesState)
			.filter(s => s.saved && !s.libur)
			.reduce((sum, s) => sum + s.hijau, 0)
	);
	const totalMerah = $derived(
		Object.values(salesState)
			.filter(s => s.saved && !s.libur)
			.reduce((sum, s) => sum + s.merah, 0)
	);

	// Section groups (sorted by name)
	const sectionTersimpan = $derived(
		sortedSales
			.filter(s => salesState[s.id]?.saved && !salesState[s.id]?.libur)
			.sort((a, b) => a.name.localeCompare(b.name, 'id'))
	);
	const sectionLibur = $derived(
		sortedSales
			.filter(s => salesState[s.id]?.libur)
			.sort((a, b) => a.name.localeCompare(b.name, 'id'))
	);
	const sectionBelum = $derived(
		sortedSales
			.filter(s => !salesState[s.id]?.saved && !salesState[s.id]?.libur)
			.sort((a, b) => a.name.localeCompare(b.name, 'id'))
	);

	let activeTab: 'belum' | 'tersimpan' | 'libur' | null = $state('belum');
	let autoSwitched = $state(false);

	// Toggle tab: click same tab → close
	function switchTab(tab: 'belum' | 'tersimpan' | 'libur') {
		activeTab = activeTab === tab ? null : tab;
		// If user manually goes to 'belum' after auto-switch, allow it
		if (tab === 'belum') autoSwitched = true;
	}

	// Auto-switch to Tersimpan when all done (one-shot per session)
	$effect(() => {
		if (allSaved && activeTab === 'belum' && !autoSwitched) {
			activeTab = 'tersimpan';
			autoSwitched = true;
		}
	});

	const allSaved = $derived(sectionBelum.length === 0);

	// Search
	let searchText = $state('');

	const filteredBelum = $derived(
		searchText
			? sectionBelum.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()))
			: sectionBelum
	);
	const filteredTersimpan = $derived(
		searchText
			? sectionTersimpan.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()))
			: sectionTersimpan
	);
	const filteredLibur = $derived(
		searchText
			? sectionLibur.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()))
			: sectionLibur
	);
</script>

<div class="app">
	<header class="header">
		<h1>Pesanan Tempe Harian</h1>
		<div class="date-display">{formatDisplayDate(selectedDate)}</div>
		{#if lastUpdated}
			<div class="updated-info">Terakhir update data {lastUpdated}</div>
		{/if}
	</header>

	<!-- Summary -->
	<div class="summary-bar">
		<div class="summary-item-bar" style="--clr: #FF9800">
			<span class="summary-label">🟠 Oranye</span>
			<span class="summary-value">{totalOranye}</span>
		</div>
		<div class="summary-item-bar" style="--clr: #4CAF50">
			<span class="summary-label">🟢 Hijau</span>
			<span class="summary-value">{totalHijau}</span>
		</div>
		<div class="summary-item-bar" style="--clr: #F44336">
			<span class="summary-label">🔴 Merah</span>
			<span class="summary-value">{totalMerah}</span>
		</div>
	</div>

	<div class="toolbar">
		<span class="counter-inline">{savedCount}/{totalCount} tersimpan</span>
		<button class="reset-btn" onclick={handleReset}>Reset</button>
	</div>

	<!-- Searchbar -->
	<div class="searchbar">
		<input
			type="text"
			class="search-input"
			placeholder="🔍 Cari nama sales..."
			bind:value={searchText}
		/>
		{#if searchText}
			<button class="search-clear" onclick={() => searchText = ''}>✕</button>
		{/if}
	</div>

	<!-- Floating tab bar -->
	<div class="tab-bar">
		<button
			class="tab"
			class:active={activeTab === 'belum'}
			onclick={() => switchTab('belum')}
		>
			📝 Belum <span class="tab-count">{sectionBelum.length}</span>
		</button>
		<button
			class="tab"
			class:active={activeTab === 'tersimpan'}
			onclick={() => switchTab('tersimpan')}
		>
			✅ Tersimpan <span class="tab-count">{sectionTersimpan.length}</span>
		</button>
		<button
			class="tab"
			class:active={activeTab === 'libur'}
			onclick={() => switchTab('libur')}
		>
			🚫 Libur <span class="tab-count">{sectionLibur.length}</span>
		</button>
	</div>

	<main class="main">
		{#if activeSales.length === 0}
			<div class="empty">Tidak ada sales aktif</div>
		{:else if activeTab === 'belum'}
			<div class="section-body">
				{#if sectionBelum.length === 0}
					<div class="empty-section done">
					<p>Semua sudah terkonfirmasi ✅</p>
					<button class="save-data-inline" onclick={handleDownload}>
						💾 Simpan Data
					</button>
				</div>
				{:else}
					{#each filteredBelum as sales (sales.id)}
						{@const s = salesState[sales.id]}
						{#if s}
							<SalesCard
								name={sales.name}
								oranye={s.oranye}
								hijau={s.hijau}
								merah={s.merah}
								libur={s.libur}
								saved={s.saved}
								savedAt={s.savedAt}
								onSave={() => handleSave(sales.id)}
								onUpdate={(data) => updateSales(sales.id, data)}
								onEdit={() => handleEdit(sales.id)}
							/>
						{/if}
					{/each}
				{/if}
			</div>
		{:else if activeTab === 'tersimpan'}
			<div class="section-body">
				{#if sectionTersimpan.length === 0}
					<div class="empty-section">Belum ada</div>
				{:else}
					{#each filteredTersimpan as sales (sales.id)}
						{@const s = salesState[sales.id]}
						{#if s}
							<SalesCard
								name={sales.name}
								oranye={s.oranye}
								hijau={s.hijau}
								merah={s.merah}
								libur={s.libur}
								saved={s.saved}
								savedAt={s.savedAt}
								onSave={() => handleSave(sales.id)}
								onUpdate={(data) => updateSales(sales.id, data)}
								onEdit={() => handleEdit(sales.id)}
							/>
						{/if}
					{/each}
				{/if}
			</div>
		{:else if activeTab === 'libur'}
			<div class="section-body">
				{#if sectionLibur.length === 0}
					<div class="empty-section">Semua masuk</div>
				{:else}
					{#each filteredLibur as sales (sales.id)}
						{@const s = salesState[sales.id]}
						{#if s}
							<SalesCard
								name={sales.name}
								oranye={s.oranye}
								hijau={s.hijau}
								merah={s.merah}
								libur={s.libur}
								saved={s.saved}
								savedAt={s.savedAt}
								onSave={() => handleSave(sales.id)}
								onUpdate={(data) => updateSales(sales.id, data)}
								onEdit={() => handleEdit(sales.id)}
							/>
						{/if}
					{/each}
				{/if}
			</div>
		{/if}
	</main>

	{#if showResetConfirm}
		<div class="overlay" onclick={() => showResetConfirm = false} role="dialog">
			<div class="dialog" onclick={(e: MouseEvent) => e.stopPropagation()}>
				<p>⚠️ <strong>Reset semua data?</strong></p>
				<p class="dialog-hint">Ketik <code>RESET</code> untuk konfirmasi</p>
				<input
					type="text"
					class="reset-input"
					placeholder="Ketik RESET..."
					bind:value={resetInputText}
					onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') confirmReset(); }}
				/>
				<div class="dialog-actions">
					<button class="dialog-btn cancel" onclick={() => showResetConfirm = false}>Batal</button>
					<button
						class="dialog-btn danger"
						disabled={resetInputText !== RESET_CONFIRM_WORD}
						onclick={confirmReset}
					>
						Hapus Semua
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if toast}
		<div class="toast">{toast}</div>
	{/if}
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
		text-align: center;
	}

	.header h1 {
		font-size: 1.25rem;
		color: #ffffff;
		margin-bottom: 0.25rem;
	}

	.date-display {
		font-size: 0.9rem;
		color: #888;
	}

	.updated-info {
		font-size: 0.75rem;
		color: #555;
		margin-top: 0.2rem;
	}

	/* Summary bar */
	.summary-bar {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.summary-item-bar {
		flex: 1;
		background: #1e1e1e;
		border: 1px solid #333;
		border-left: 3px solid var(--clr);
		border-radius: 8px;
		padding: 0.6rem 0.5rem;
		text-align: center;
	}

	.summary-label {
		display: block;
		font-size: 0.7rem;
		color: #888;
		margin-bottom: 0.2rem;
	}

	.summary-value {
		display: block;
		font-size: 1.3rem;
		font-weight: 700;
		color: #fff;
	}

	.toolbar {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
		align-items: center;
		justify-content: space-between;
	}

	.counter-inline {
		font-size: 0.85rem;
		color: #888;
	}

	.reset-btn {
		padding: 0.5rem 1rem;
		background: #F44336;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.85rem;
	}

	.reset-btn:active {
		opacity: 0.8;
	}

	/* Searchbar */
	.searchbar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.search-input {
		flex: 1;
		padding: 0.55rem 0.8rem;
		background: #1e1e1e;
		color: #e0e0e0;
		border: 1px solid #444;
		border-radius: 8px;
		font-size: 0.9rem;
		outline: none;
	}

	.search-input::placeholder {
		color: #666;
	}

	.search-input:focus {
		border-color: #FF9800;
	}

	.search-clear {
		padding: 0.3rem 0.6rem;
		background: #333;
		color: #aaa;
		border: none;
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.search-clear:active {
		background: #444;
	}

	/* Sticky tab bar */
	.tab-bar {
		position: sticky;
		top: 0;
		z-index: 40;
		display: flex;
		gap: 0.4rem;
		padding: 0.5rem 0 0.75rem;
		background: #121212;
	}

	.tab {
		flex: 1;
		padding: 0.5rem 0.4rem;
		background: #1e1e1e;
		color: #888;
		border: 1px solid #333;
		border-radius: 8px;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		white-space: nowrap;
	}

	.tab:active {
		background: #2a2a2a;
	}

	.tab.active {
		background: #2a2a2a;
		color: #fff;
		border-color: #555;
	}

	.tab-count {
		color: #aaa;
		font-size: 0.7rem;
	}

	.tab.active .tab-count {
		color: #fff;
	}

	.main {
		padding-bottom: 1rem;
	}

	.empty {
		text-align: center;
		color: #888;
		padding: 3rem 1rem;
		font-size: 1.1rem;
	}

	.section-body {
		padding-bottom: 1rem;
	}

	.empty-section {
		text-align: center;
		color: #555;
		padding: 2rem 1rem;
		font-size: 0.9rem;
	}

	.empty-section.done {
		color: #4CAF50;
		font-weight: 600;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.empty-section.done p {
		margin: 0;
	}

	.save-data-inline {
		padding: 0.7rem 2rem;
		background: #4CAF50;
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.save-data-inline:active {
		opacity: 0.85;
	}

	/* Reset confirm dialog */
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
	}

	.dialog {
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 12px;
		padding: 1.5rem;
		max-width: 320px;
		width: 100%;
		text-align: center;
	}

	.dialog p {
		color: #e0e0e0;
		font-size: 1rem;
		margin-bottom: 1rem;
	}

	.dialog-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.dialog-btn {
		padding: 0.6rem 1.25rem;
		border: none;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
	}

	.dialog-btn.cancel {
		background: #444;
		color: #ccc;
	}

	.dialog-btn.danger {
		background: #F44336;
		color: #fff;
	}

	.dialog-btn.danger:disabled {
		background: #555;
		color: #999;
		cursor: not-allowed;
	}

	.dialog-hint {
		font-size: 0.8rem;
		color: #888;
		margin-bottom: 0.75rem;
	}

	.dialog-hint code {
		background: #444;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.85rem;
		font-weight: 700;
		color: #F44336;
	}

	.reset-input {
		width: 100%;
		padding: 0.6rem 0.8rem;
		background: #1e1e1e;
		color: #e0e0e0;
		border: 1px solid #555;
		border-radius: 8px;
		font-size: 1rem;
		text-align: center;
		outline: none;
		margin-bottom: 1rem;
		box-sizing: border-box;
	}

	.reset-input:focus {
		border-color: #F44336;
	}

	.reset-input::placeholder {
		color: #555;
	}

	/* Toast */
	.toast {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background: #333;
		color: #fff;
		padding: 0.6rem 1.25rem;
		border-radius: 20px;
		font-size: 0.9rem;
		font-weight: 600;
		z-index: 200;
		animation: toast-in 0.2s ease;
	}

	@keyframes toast-in {
		from { opacity: 0; transform: translateX(-50%) translateY(10px); }
		to { opacity: 1; transform: translateX(-50%) translateY(0); }
	}
</style>
