<script lang="ts">
  import Pictogram from './Pictogram.svelte';
  import { colorHex } from '../content/palette';

  let { color, icon, size = 40 }: { color: string | null; icon: string; size?: number } = $props();
</script>

<span class="badge" style:--c={colorHex(color)} style:width="{size}px" style:height="{size}px">
  <Pictogram id={icon} size={Math.round(size * 0.56)} stroke={size > 48 ? 1.6 : 1.8} />
</span>

<style>
  .badge {
    display: inline-grid;
    place-items: center;
    flex: none;
    border-radius: 28%;
    background: var(--c);
    color: #fffaf2;
    box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.12);
  }
</style>
