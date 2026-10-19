<script lang="ts" module>
  // Kleine, ruhige Illustrationen für leere Zustände. Farben kommen aus den Design-Tokens.
  export type IllustrationName = 'folders' | 'cards' | 'history' | 'messages' | 'search' | 'done';
</script>

<script lang="ts">
  let { name, size = 148 }: { name: IllustrationName; size?: number } = $props();
</script>

<svg width={size} height={size * 0.8} viewBox="0 0 160 128" fill="none" aria-hidden="true">
  <ellipse cx="80" cy="70" rx="66" ry="52" fill="var(--surface-2)" />
  <g stroke-linecap="round" stroke-linejoin="round">
    {#if name === 'folders'}
      <path d="M38 50a6 6 0 0 1 6-6h18l7 8h36a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6z" fill="var(--surface-3)" />
      <path d="M50 58a6 6 0 0 1 6-6h17l7 8h34a6 6 0 0 1 6 6v34a6 6 0 0 1-6 6H56a6 6 0 0 1-6-6z" fill="var(--accent)" opacity="0.9" />
      <path d="M78 84c-3.4-2.8-9-6.6-9-11a4.6 4.6 0 0 1 9-1.3 4.6 4.6 0 0 1 9 1.3c0 4.4-5.6 8.2-9 11z" fill="var(--bg-elev)" />
      <circle cx="128" cy="34" r="3" fill="var(--warm)" />
      <circle cx="30" cy="96" r="2.5" fill="var(--accent)" opacity="0.5" />
    {:else if name === 'cards'}
      <rect x="44" y="40" width="70" height="48" rx="7" fill="var(--surface-3)" transform="rotate(-8 79 64)" />
      <rect x="46" y="42" width="70" height="48" rx="7" fill="var(--bg-elev)" stroke="var(--line-strong)" transform="rotate(5 81 66)" />
      <g transform="rotate(5 81 66)">
        <path d="M46 54h70" stroke="var(--bad)" stroke-width="1.6" opacity="0.7" />
        <path d="M56 66h40M56 75h28" stroke="var(--text-3)" stroke-width="2.2" opacity="0.55" />
      </g>
      <circle cx="122" cy="32" r="9" fill="var(--accent)" />
      <path d="M122 28v8M118 32h8" stroke="var(--on-accent)" stroke-width="2.2" />
      <circle cx="34" cy="92" r="2.5" fill="var(--warm)" />
    {:else if name === 'history'}
      <rect x="42" y="36" width="76" height="62" rx="9" fill="var(--bg-elev)" stroke="var(--line-strong)" />
      <path d="M42 50h76" stroke="var(--line-strong)" />
      <path d="M58 30v12M102 30v12" stroke="var(--text-3)" stroke-width="3" />
      {#each [0, 1, 2, 3, 4] as c}
        {#each [0, 1, 2] as r}
          <rect
            x={50 + c * 13}
            y={57 + r * 12}
            width="9"
            height="8"
            rx="2"
            fill={(c + r) % 3 === 0 ? 'var(--heat-3)' : (c * r) % 2 ? 'var(--heat-2)' : 'var(--heat-1)'}
          />
        {/each}
      {/each}
      <path d="M128 98c0-8 0-14 0-20m0 6c0-6 5-9 10-9 0 6-5 9-10 9zm0 4c0-5-4-8-9-8 0 5 4 8 9 8z" stroke="var(--good)" stroke-width="2" fill="var(--good-soft)" />
    {:else if name === 'messages'}
      <path d="M40 46a8 8 0 0 1 8-8h52a8 8 0 0 1 8 8v28a8 8 0 0 1-8 8H66l-12 10v-10h-6a8 8 0 0 1-8-8z" fill="var(--bg-elev)" stroke="var(--line-strong)" />
      <path d="M74 70c-3.6-3-9.5-7-9.5-11.6a4.8 4.8 0 0 1 9.5-1.4 4.8 4.8 0 0 1 9.5 1.4c0 4.6-5.9 8.6-9.5 11.6z" fill="var(--bad)" opacity="0.75" />
      <circle cx="122" cy="44" r="10" fill="var(--accent)" opacity="0.85" />
      <path d="M118 44h8" stroke="var(--on-accent)" stroke-width="2" />
      <circle cx="120" cy="96" r="2.5" fill="var(--warm)" />
    {:else if name === 'search'}
      <rect x="40" y="44" width="68" height="46" rx="7" fill="var(--bg-elev)" stroke="var(--line-strong)" />
      <path d="M50 58h36M50 68h26M50 78h32" stroke="var(--text-3)" stroke-width="2.2" opacity="0.5" />
      <circle cx="104" cy="72" r="15" fill="var(--bg)" stroke="var(--accent)" stroke-width="4" />
      <path d="M115 83l12 12" stroke="var(--accent)" stroke-width="5" />
    {:else if name === 'done'}
      <rect x="46" y="38" width="68" height="52" rx="8" fill="var(--bg-elev)" stroke="var(--line-strong)" transform="rotate(-4 80 64)" />
      <circle cx="80" cy="64" r="16" fill="var(--good-soft)" />
      <path d="M72 64.5l5.5 5.5L89 58.5" stroke="var(--good)" stroke-width="3.5" />
      <path d="M124 34v8M120 38h8M36 50v6M33 53h6" stroke="var(--warm)" stroke-width="2" />
      <circle cx="122" cy="94" r="3" fill="var(--accent)" opacity="0.6" />
    {/if}
  </g>
</svg>
