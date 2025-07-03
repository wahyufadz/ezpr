<script lang="ts">
  import { COLORS } from '$lib/colors';
  let menuOpen = false;
  const routes = [
    { name: 'Dashboard', path: '/' },
    { name: 'Tahu', path: '/tahu' },
    { name: 'Pengaturan', path: '/pengaturan' },
  ];
</script>

<nav class="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-3 pixel-border bg-[var(--color-white)] z-50" style="border-width:1.5px; box-shadow:0 2px 8px 0 rgba(34,40,49,0.04);">
  <div class="flex items-center">
    <span class="font-bold text-lg tracking-wide" style="color:{COLORS.lightGreen};font-family:'Press Start 2P',monospace;">ezpr</span>
  </div>
  <button class="ml-2 flex flex-col justify-center items-center w-9 h-9 rounded focus:outline-none" aria-label="Menu" on:click={() => menuOpen = !menuOpen}>
    <span class="block w-7 h-1 mb-1 rounded bg-[var(--color-black)]"></span>
    <span class="block w-7 h-1 mb-1 rounded bg-[var(--color-black)]"></span>
    <span class="block w-7 h-1 rounded bg-[var(--color-black)]"></span>
  </button>
  {#if menuOpen}
    <div class="absolute top-16 right-4 z-50 w-44 pixel-border bg-[var(--color-white)] py-3 flex flex-col shadow-lg animate-fade-in">
      {#each routes as route}
        <a href={route.path} class="px-5 py-3 text-sm font-bold text-left hover:bg-[var(--color-lightGreen)] transition rounded" style="color:{COLORS.black};font-family:'Press Start 2P',monospace;">{route.name}</a>
      {/each}
    </div>
  {/if}
</nav>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.18s ease;
  }
</style> 