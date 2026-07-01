<script lang="ts">
	let { value = 0, onChange, color = '#888', disabled = false }: {
		value: number;
		onChange: (val: number) => void;
		color?: string;
		disabled?: boolean;
	} = $props();

	function add(amount: number) {
		const next = Math.max(0, value + amount);
		if (next !== value) onChange(next);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const raw = target.value.replace(/[^0-9]/g, '');
		const n = raw === '' ? 0 : parseInt(raw, 10);
		if (!isNaN(n) && n >= 0) onChange(n);
	}
</script>

<div class="stepper" class:disabled>
	<button class="stepper-btn minus" onclick={() => add(-10)} disabled={disabled || value <= 0} aria-label="Kurangi 10">
		−
	</button>
	<input
		type="text"
		inputmode="numeric"
		pattern="[0-9]*"
		class="stepper-input"
		style="--stepper-color: {color}; border-color: {color}"
		value={value}
		oninput={handleInput}
		disabled={disabled}
	/>
	<button class="stepper-btn plus" onclick={() => add(10)} disabled={disabled} aria-label="Tambah 10" style="background: {color}; color: #121212">
		+
	</button>
</div>

<style>
	.stepper {
		display: flex;
		align-items: center;
		gap: 0;
	}

	.stepper-btn {
		width: 48px;
		height: 48px;
		border: 2px solid #444;
		background: #2a2a2a;
		color: #e0e0e0;
		font-size: 1.5rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.stepper-btn:active:not(:disabled) {
		opacity: 0.7;
	}

	.stepper-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.stepper-btn.minus {
		border-radius: 8px 0 0 8px;
	}

	.stepper-btn.plus {
		border-radius: 0 8px 8px 0;
	}

	.stepper-input {
		width: 80px;
		height: 48px;
		border: 2px solid;
		border-left: none;
		border-right: none;
		background: #1e1e1e;
		color: #ffffff;
		font-size: 1.25rem;
		font-weight: bold;
		text-align: center;
		outline: none;
	}

	.stepper-input:focus {
		background: #282828;
	}

	.stepper-input:disabled {
		opacity: 0.3;
	}
</style>
