<script lang="ts">
  import { colorHex } from '../content/palette';
  let { color, size = 40 }: { color: string; size?: number } = $props();
</script>

<span class="deck" style:--c={colorHex(color)} style:width="{size}px" style:height="{size}px" aria-hidden="true">
  <svg viewBox="0 0 40 40" width={size} height={size}>
    <rect x="9" y="8" width="22" height="17" rx="3.5" fill="var(--c)" opacity="0.35" transform="rotate(-8 20 16)" />
    <rect x="9" y="14" width="22" height="17" rx="3.5" fill="var(--c)" />
    <path d="M13 20.5h14" stroke="#fffaf2" stroke-width="1.6" stroke-linecap="round" opacity="0.85" />
    <path d="M13 25h9" stroke="#fffaf2" stroke-width="1.6" stroke-linecap="round" opacity="0.6" />
  </svg>
</span>

<style>
  .deck {
    display: inline-grid;
    place-items: center;
    flex: none;
    border-radius: 28%;
    background: color-mix(in srgb, var(--c) 14%, transparent);
  }
</style>
