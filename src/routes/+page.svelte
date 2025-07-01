<script lang="ts">
  import { COLORS } from '$lib/colors';
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-[var(--color-white)] px-4 py-8">
  <div class="pixel-border w-full max-w-sm bg-transparent p-6 mb-8 flex flex-col items-center" style="box-shadow: none;">
    <h1 class="text-3xl md:text-4xl font-bold mb-3 text-center tracking-wide" style="color: {COLORS.black}">
      <span style="color: {COLORS.lightGreen}">ezpr</span>
    </h1>
    <p class="text-base md:text-lg mb-6 text-center font-normal" style="color: {COLORS.black}">
      <span class="block mb-2" style="color: {COLORS.lightYellow}">Eazy Production Reporting</span>
      Pelaporan produksi yang <b>mudah</b>, <b>cepat</b>, dan <b>minimalis</b>.<br />
      <span class="inline-block mt-3 px-3 py-2 rounded" style="background: {COLORS.lightGreen}; color: {COLORS.black}; font-size: 0.95em;">Akses optimal di smartphone</span>
    </p>
    <button class="btn-pixel w-full mt-2">Mulai</button>
  </div>
</div>
