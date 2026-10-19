<script lang="ts">
  import { uiIcons, type UiIcon } from './icons';

  let { name, size = 24, stroke = 1.8, label }: { name: UiIcon; size?: number; stroke?: number; label?: string } =
    $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
  focusable="false"
>
  {@html uiIcons[name]}
</svg>

<style>
  svg {
    display: block;
    flex: none;
  }
</style>
