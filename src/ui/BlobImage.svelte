<script lang="ts">
  import { db } from '../lib/db/db';

  let { id, alt = '' }: { id: string; alt?: string } = $props();
  let url = $state<string | null>(null);

  $effect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    db.images.get(id).then((img) => {
      if (cancelled || !img) return;
      objectUrl = URL.createObjectURL(img.blob);
      url = objectUrl;
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      url = null;
    };
  });
</script>

{#if url}
  <img src={url} {alt} draggable="false" />
{:else}
  <div class="placeholder" aria-hidden="true"></div>
{/if}

<style>
  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--radius-m);
    -webkit-user-drag: none;
    user-select: none;
  }

  .placeholder {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-m);
    background: var(--surface-2);
  }
</style>
