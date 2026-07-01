<script lang="ts">
	import NumberStepper from './NumberStepper.svelte';

	let {
		name,
		oranye = 0,
		hijau = 0,
		merah = 0,
		libur = false,
		saved = false,
		savedAt = '',
		onSave,
		onUpdate,
		onEdit
	}: {
		name: string;
		oranye?: number;
		hijau?: number;
		merah?: number;
		libur?: boolean;
		saved?: boolean;
		savedAt?: string;
		onSave: () => void;
		onUpdate: (data: { oranye: number; hijau: number; merah: number; libur: boolean }) => void;
		onEdit: () => void;
	} = $props();

	let showConfirm = $state(false);

	function updateOranye(v: number) { onUpdate({ oranye: v, hijau, merah, libur }); }
	function updateHijau(v: number) { onUpdate({ oranye, hijau: v, merah, libur }); }
	function updateMerah(v: number) { onUpdate({ oranye, hijau, merah: v, libur }); }

	function toggleLibur() {
		const nextLibur = !libur;
		if (nextLibur) {
			onUpdate({ oranye: 0, hijau: 0, merah: 0, libur: true });
		} else {
			onUpdate({ oranye: 0, hijau: 0, merah: 0, libur: false });
		}
	}

	function handleUnLibur() {
		onUpdate({ oranye: 0, hijau: 0, merah: 0, libur: false });
		onEdit();
	}

	function handleSave() {
		const allZero = oranye === 0 && hijau === 0 && merah === 0;
		if (allZero && !libur) {
			showConfirm = true;
			return;
		}
		onSave();
	}

	function confirmSave() {
		showConfirm = false;
		onSave();
	}

	function cancelSave() {
		showConfirm = false;
	}
</script>

<div class="card" class:libur={libur} class:saved={saved && !libur}>
	{#if libur}
		<!-- LIBUR: always read-only -->
		<div class="card-header">
			<h2 class="card-name">{name}</h2>
			<span class="libur-badge-inline">🚫 LIBUR</span>
		</div>
		<button class="edit-btn" onclick={handleUnLibur}>
			✏️ Ubah
		</button>

	{:else if saved}
		<!-- SAVED: read-only summary -->
		<div class="card-header">
			<h2 class="card-name">{name}</h2>
			<span class="saved-badge">✅ {savedAt}</span>
		</div>
		<div class="saved-summary">
			<div class="summary-items">
				{#if oranye > 0}
					<div class="summary-item" style="--clr: #FF9800">
						<span class="summary-variant">🟠 Oranye</span>
						<span class="summary-qty">{oranye}</span>
					</div>
				{/if}
				{#if hijau > 0}
					<div class="summary-item" style="--clr: #4CAF50">
						<span class="summary-variant">🟢 Hijau</span>
						<span class="summary-qty">{hijau}</span>
					</div>
				{/if}
				{#if merah > 0}
					<div class="summary-item" style="--clr: #F44336">
						<span class="summary-variant">🔴 Merah</span>
						<span class="summary-qty">{merah}</span>
					</div>
				{/if}
				{#if oranye === 0 && hijau === 0 && merah === 0}
					<div class="summary-zero">Semua varian 0</div>
				{/if}
			</div>
		</div>
		<button class="edit-btn" onclick={onEdit}>
			✏️ Ubah
		</button>

	{:else}
		<!-- EDIT VIEW -->
		<div class="card-header">
			<h2 class="card-name">{name}</h2>
			<label class="libur-toggle">
				<input type="checkbox" checked={false} onchange={toggleLibur} />
				<span class="libur-label">Libur</span>
			</label>
		</div>

		<div class="variants">
			<div class="variant-row">
				<span class="variant-label" style="--clr: #FF9800">🟠 Tempe Oranye</span>
				<NumberStepper value={oranye} onChange={updateOranye} color="#FF9800" />
			</div>
			<div class="variant-row">
				<span class="variant-label" style="--clr: #4CAF50">🟢 Tempe Hijau</span>
				<NumberStepper value={hijau} onChange={updateHijau} color="#4CAF50" />
			</div>
			<div class="variant-row">
				<span class="variant-label" style="--clr: #F44336">🔴 Tempe Merah</span>
				<NumberStepper value={merah} onChange={updateMerah} color="#F44336" />
			</div>
		</div>

		<div class="card-footer">
			<button class="save-btn" onclick={handleSave}>
				Simpan
			</button>
		</div>
	{/if}

	{#if showConfirm}
		<div class="overlay" onclick={cancelSave} role="dialog">
			<div class="dialog" onclick={(e: MouseEvent) => e.stopPropagation()}>
				<p>{name} <strong>semua 0</strong>. Lanjut simpan?</p>
				<div class="dialog-actions">
					<button class="dialog-btn cancel" onclick={cancelSave}>Batal</button>
					<button class="dialog-btn ok" onclick={confirmSave}>Ya, Simpan</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.card {
		background: #1e1e1e;
		border: 1px solid #333;
		border-radius: 12px;
		padding: 1rem;
		margin-bottom: 1rem;
		transition: opacity 0.2s, border-color 0.2s;
	}

	.card.libur {
		opacity: 0.5;
		background: #1a1a1a;
	}

	.card.saved {
		border-color: #4CAF50;
		background: #1a2a1a;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.card-name {
		font-size: 1.15rem;
		font-weight: 700;
		color: #ffffff;
	}

	.libur-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.libur-toggle input {
		width: 20px;
		height: 20px;
		accent-color: #F44336;
		cursor: pointer;
	}

	.libur-label {
		font-size: 0.95rem;
		font-weight: 600;
		color: #ccc;
	}

	.libur-badge-inline {
		font-size: 0.95rem;
		font-weight: 700;
		color: #F44336;
	}

	.variants {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.variant-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.variant-label {
		font-size: 0.95rem;
		color: #e0e0e0;
		min-width: 120px;
	}

	/* Saved summary */
	.saved-badge {
		color: #4CAF50;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.saved-summary {
		padding: 0.25rem 0;
	}

	.summary-items {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3rem 0.5rem;
		background: rgba(255,255,255,0.05);
		border-radius: 6px;
		border-left: 3px solid var(--clr);
	}

	.summary-variant {
		font-size: 0.95rem;
		color: #e0e0e0;
	}

	.summary-qty {
		font-size: 1.1rem;
		font-weight: 700;
		color: #fff;
	}

	.summary-zero {
		color: #888;
		font-size: 0.9rem;
		text-align: center;
		padding: 0.25rem;
	}

	/* Buttons */
	.card-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-top: 0.75rem;
		border-top: 1px solid #333;
	}

	.save-btn {
		padding: 0.6rem 1.5rem;
		background: #4CAF50;
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.save-btn:active {
		opacity: 0.8;
	}

	.edit-btn {
		width: 100%;
		padding: 0.5rem;
		margin-top: 0.5rem;
		background: transparent;
		color: #FF9800;
		border: 1px solid #FF9800;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.edit-btn:active {
		background: rgba(255,152,0,0.1);
	}

	/* Zero confirm dialog */
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
		line-height: 1.5;
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

	.dialog-btn.ok {
		background: #FF9800;
		color: #121212;
	}
</style>
