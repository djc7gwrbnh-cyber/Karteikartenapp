<script lang="ts">
  // Vorschaubild aus der Datenbank, wird erst geladen, wenn es sichtbar ist.
  import { db } from '../lib/db/db';

  let { id, size = 40 }: { id: string; size?: number } = $props();
  let el: HTMLSpanElement;
  let url = $state<string | null>(null);

  $effect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    const observer = new IntersectionObserver(async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const img = await db.images.get(id);
      if (cancelled || !img) return;
      objectUrl = URL.createObjectURL(img.blob);
      url = objectUrl;
    });
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  });
</script>

<span class="thumb" bind:this={el} style:width="{size}px" style:height="{size}px">
  {#if url}<img src={url} alt="" />{/if}
</span>

<style>
  .thumb {
    flex: none;
    border-radius: 8px;
    overflow: hidden;
    background: var(--surface-2);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
