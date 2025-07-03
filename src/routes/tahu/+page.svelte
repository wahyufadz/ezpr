<script lang="ts">
  import { COLORS } from '$lib/colors';

  // Step state
  let step = 1;
  const totalSteps = 5;

  // Step 1: Pilih Pabrik
  const pabrikList = [
    { id: 'buaji', name: 'Buaji' },
    { id: 'saelus', name: 'Saelus' },
    { id: 'sekar', name: 'Sekar' },
    { id: 'ceningan', name: 'Ceningan' },
  ];
  let selectedPabrik: string | null = null;

  // Step 2: Absensi Dummy Data
  const karyawanDummy: Record<string, string[]> = {
    buaji: [ 'Ayu', 'Budi', 'Cici' ],
    saelus: [ 'Dewi', 'Eka', 'Fajar' ],
    sekar: [ 'Gilang', 'Hana', 'Indra' ],
    ceningan: [ 'Joko', 'Kiki', 'Lina' ]
  };
  let absensi: Record<string, string> = {};
  let karyawan: string[] = [];

  $: if (step === 2 && selectedPabrik) {
    karyawan = karyawanDummy[selectedPabrik];
    // Inisialisasi absensi jika belum ada
    karyawan.forEach(nama => {
      if (!(nama in absensi)) absensi[nama] = '';
    });
  }

  const absensiOptions = [
    { id: 'rebus', label: 'Rebus' },
    { id: 'cetak', label: 'Cetak' },
    { id: 'potong', label: 'Potong' },
    { id: 'libur', label: 'Libur' },
    { id: 'pulang', label: 'Pulang' },
  ];

  let pengeluaran: { label: string; nominal: string }[] = [];

  function tambahPengeluaran() {
    pengeluaran = [...pengeluaran, { label: '', nominal: '' }];
  }
  function hapusPengeluaran(idx: number) {
    pengeluaran = pengeluaran.filter((_, i) => i !== idx);
  }

  function nextStep() {
    if (step === 1 && !selectedPabrik) return;
    if (step === 2 && karyawan.some(nama => !absensi[nama])) return;
    if (step < totalSteps) step += 1;
  }
  function prevStep() {
    if (step > 1) step -= 1;
  }

  type Sales = {
    nama: string;
    pabrik: string;
  };

  // Sales dummy data
  const salesList: Sales[] = [
    { nama: 'Andi', pabrik: 'buaji' },
    { nama: 'Budi', pabrik: 'saelus' },
    { nama: 'Cici', pabrik: 'buaji' },
    { nama: 'Dewi', pabrik: 'sekar' },
    { nama: 'Eka', pabrik: 'ceningan' },
    { nama: 'Fajar', pabrik: 'saelus' },
    { nama: 'Gilang', pabrik: 'ceningan' },
  ];
  let salesOrder: Record<string, string> = {};
  let filteredSales: Sales[] = [];

  $: if (step === 4 && selectedPabrik) {
    filteredSales = salesList.filter(s => s.pabrik === selectedPabrik);
    filteredSales.forEach(s => {
      if (!(s.nama in salesOrder)) salesOrder[s.nama] = '';
    });
  }

  function selectAllOnFocus(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  function numberOnlyInput(event: KeyboardEvent) {
    const isNumber = event.key >= '0' && event.key <= '9';
    const isAllowed = event.key === 'Backspace' || event.key === 'Delete' || event.key === 'ArrowLeft' || event.key === 'ArrowRight';
    if (!isNumber && !isAllowed) event.preventDefault();
  }
</script>

<div class="max-w-full mx-auto mt-8 mb-16 px-0 relative pt-20">
  <div class="overflow-y-auto pb-32 px-2" style="max-height:calc(100vh - 140px);">
    <!-- Sticky Header for Step Title & Subtitle -->
    <div class="sticky top-0 z-30 bg-white pt-2 pb-2" style="box-shadow:0 2px 8px 0 rgba(34,40,49,0.04);">
      <div class="flex items-center justify-center my-2">
        <!-- Step Indicator -->
        {#each Array(totalSteps) as _, i}
          <div class="w-7 h-7 flex items-center justify-center rounded-full mx-1 font-bold text-xs"
          style="background: {i+1 === step ? COLORS.lightGreen : COLORS.lightYellow}; color: {COLORS.black}; border:2px solid {COLORS.border}; font-family:'Press Start 2P',monospace;">{i+1}</div>
        {/each}
      </div>
      
      {#if step === 1}
        <h1 class="text-lg font-bold mb-1 text-center" style="color:{COLORS.black}">Pilih Pabrik</h1>
      {:else if step === 2}
        <h1 class="text-lg font-bold mb-1 text-center" style="color:{COLORS.black}">Absensi Karyawan</h1>
      {:else if step === 3}
        <h1 class="text-lg font-bold mb-1 text-center" style="color:{COLORS.black}">Pengeluaran</h1>
        <h2 class="text-m font-normal mb-1 text-center" style="color:{COLORS.black}">{pengeluaran.length > 0 ? `Total: ${pengeluaran.reduce((acc, item) => acc + Number(item.nominal), 0).toLocaleString()}` : ''}</h2>
      {:else if step === 4}
        <h1 class="text-lg font-bold mb-1 text-center" style="color:{COLORS.black}">Pesanan Sales</h1>
        <h2 class="text-m font-normal mb-1 text-center" style="color:{COLORS.black}">Total pesanan: {Object.values(salesOrder).reduce((acc, val) => acc + (Number(val) || 0), 0).toLocaleString()}</h2>
      {:else}
        <h1 class="text-lg font-bold mb-1 text-center" style="color:{COLORS.black}">Konfirmasi &amp; Ringkasan</h1>
      {/if}
    </div>
    <!-- Step Content -->
    {#if step === 1}
      <div class="mb-8 mt-2">
        <div class="grid grid-cols-2 gap-4">
          {#each pabrikList as pabrik}
            <button type="button"
              class="btn-pixel w-full mb-2 {selectedPabrik === pabrik.id ? 'ring-2 ring-[var(--color-light-green)]' : ''}"
              on:click={() => selectedPabrik = pabrik.id}>
              {selectedPabrik===pabrik.id?"✅":""} {pabrik.name}
            </button>
          {/each}
        </div>
      </div>
    {:else if step === 2}
      <div class="mb-8">
        <div class="space-y-4">
          {#each karyawan as nama}
            <div class="bg-[var(--color-light-yellow)] rounded px-3 py-3 mb-2">
              <div class="font-bold text-base mb-2" style="color:{COLORS.black};font-family:'Press Start 2P',monospace;">{nama}</div>
              <div class="grid grid-cols-3 gap-2 mb-2">
                {#each absensiOptions.slice(0,3) as opt}
                  <button type="button"
                    class="btn-pixel py-3 text-base {absensi[nama] === opt.id ? 'ring-2 ring-[var(--color-light-green)]' : ''}"
                    style="min-width:80px; font-size:1rem; padding:0.7rem 0.6rem;"
                    on:click={() => absensi[nama] = opt.id}>
                    {absensi[nama]===opt.id?"✅":""} {opt.label}
                  </button>
                {/each}
              </div>
              <div class="grid grid-cols-2 gap-2">
                {#each absensiOptions.slice(3) as opt}
                  <button type="button"
                    class="btn-pixel py-3 text-base {absensi[nama] === opt.id ? 'ring-2 ring-[var(--color-light-green)]' : ''}"
                    style="min-width:80px; font-size:1rem; padding:0.7rem 0.6rem;"
                    on:click={() => absensi[nama] = opt.id}>
                    {absensi[nama]===opt.id?"✅":""} {opt.label}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if step === 3}
      <div class="mb-8">
        <div class="space-y-4">
          {#each pengeluaran as item, idx}
            <div class="flex items-stretch gap-2 mb-3">
              <button type="button" class="btn-pixel px-2 text-base h-full flex-shrink-0" style="min-width:2.5rem;" on:click={() => hapusPengeluaran(idx)} title="Hapus">
                🗑️
              </button>
              <input class="input-pixel flex-1" type="text" placeholder="Label" bind:value={item.label} style="max-width:10rem;" />
              <input 
                class="input-pixel flex-1 min-w-0" 
                type="number" min="0" 
                placeholder="Nominal" 
                bind:value={item.nominal} on:keydown={numberOnlyInput} on:focus={selectAllOnFocus} />
            </div>
          {/each}
          <button type="button" class="btn-pixel w-full mt-2" on:click={tambahPengeluaran}>+ Tambah Pengeluaran</button>
        </div>
      </div>
    {:else if step === 4}
      <div class="mb-8">
        <div class="space-y-4">
          {#each Array(Math.ceil(filteredSales.length / 2)) as _, rowIdx}
            <div class="grid grid-cols-2 gap-2">
              {#each [0,1] as colIdx}
                {#if filteredSales[rowIdx * 2 + colIdx]}
                  <div class="flex items-center gap-2 bg-[var(--color-light-yellow)] rounded px-3 py-3 mb-2">
                    <div class="font-bold text-base flex-1" style="color:{COLORS.black};font-family:'Press Start 2P',monospace;">{filteredSales[rowIdx * 2 + colIdx].nama}</div>
                    <input class="input-pixel flex-1 min-w-0" type="number" min="0" placeholder="Jumlah Pesanan" bind:value={salesOrder[filteredSales[rowIdx * 2 + colIdx].nama]} on:keydown={numberOnlyInput} on:focus={selectAllOnFocus} />
                  </div>
                {:else}
                  <div></div>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {:else if step === 5}
      <div class="mb-8">
        <h1 class="text-lg font-bold mb-4 text-center" style="color:{COLORS.black}">Konfirmasi &amp; Ringkasan</h1>
        <div class="space-y-6">
          <!-- Step 1: Pabrik -->
          <div class="bg-[var(--color-light-yellow)] rounded px-3 py-3">
            <div class="font-bold mb-2" style="color:{COLORS.black}">Pabrik dipilih:</div>
            <div class="text-base" style="color:{COLORS.black}">{pabrikList.find(p => p.id === selectedPabrik)?.name ?? '-'}</div>
          </div>
          <!-- Step 2: Absensi -->
          <div class="bg-[var(--color-light-yellow)] rounded px-3 py-3">
            <div class="font-bold mb-2" style="color:{COLORS.black}">Absensi Karyawan:</div>
            <ul class="text-base" style="color:{COLORS.black}">
              {#each karyawan as nama}
                <li>{nama}: {absensi[nama] ? absensiOptions.find(opt => opt.id === absensi[nama])?.label : '-'}</li>
              {/each}
            </ul>
          </div>
          <!-- Step 3: Pengeluaran -->
          <div class="bg-[var(--color-light-yellow)] rounded px-3 py-3">
            <div class="font-bold mb-2" style="color:{COLORS.black}">Pengeluaran:</div>
            {#if pengeluaran.length > 0}
              <ul class="text-base" style="color:{COLORS.black}">
                {#each pengeluaran as item}
                  <li>{item.label || '-'}: {item.nominal ? Number(item.nominal).toLocaleString() : '-'}</li>
                {/each}
              </ul>
              <div class="mt-2 font-bold">Total: {pengeluaran.reduce((acc, item) => acc + Number(item.nominal), 0).toLocaleString()}</div>
            {:else}
              <div>-</div>
            {/if}
          </div>
          <!-- Step 4: Pesanan Sales -->
          <div class="bg-[var(--color-light-yellow)] rounded px-3 py-3">
            <div class="font-bold mb-2" style="color:{COLORS.black}">Pesanan Sales:</div>
            {#if filteredSales.length > 0}
              <ul class="text-base" style="color:{COLORS.black}">
                {#each filteredSales as sales}
                  <li>{sales.nama}: {salesOrder[sales.nama] ? Number(salesOrder[sales.nama]).toLocaleString() : '-'}</li>
                {/each}
              </ul>
              <div class="mt-2 font-bold">Total pesanan: {Object.values(salesOrder).reduce((acc, val) => acc + (Number(val) || 0), 0).toLocaleString()}</div>
            {:else}
              <div>-</div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Navigation Buttons Fixed Bottom -->
  <div class="fixed left-0 bottom-0 w-full bg-white border-t border-[var(--color-border)] z-50 py-4 px-0" style="box-shadow: 0 -2px 8px 0 rgba(34,40,49,0.08);">
    <div class="flex justify-center gap-4 w-full max-w-md mx-auto px-4">
      <button class="btn-pixel w-32" on:click={prevStep} disabled={step === 1} style="opacity:{step === 1 ? 0.5 : 1}">Sebelumnya</button>
      <button class="btn-pixel w-32" on:click={nextStep} disabled={(step === 1 && !selectedPabrik) || (step === 2 && karyawan.some(nama => !absensi[nama]))} style="opacity:{(step === 1 && !selectedPabrik) || (step === 2 && karyawan.some(nama => !absensi[nama])) ? 0.5 : 1}">Selanjutnya</button>
    </div>
  </div>
</div> 