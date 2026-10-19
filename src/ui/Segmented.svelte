<script lang="ts" generics="V extends string">
  let {
    value = $bindable(),
    options,
    label,
    onchange
  }: { value: V; options: { value: V; label: string }[]; label: string; onchange?: (v: V) => void } = $props();
</script>

<div class="segmented" role="radiogroup" aria-label={label}>
  {#each options as o (o.value)}
    <button
      type="button"
      role="radio"
      aria-checked={value === o.value}
      onclick={() => {
        value = o.value;
        onchange?.(o.value);
      }}>{o.label}</button
    >
  {/each}
</div>

<style>
  .segmented {
    display: flex;
    padding: 3px;
    gap: 2px;
    border-radius: 12px;
    background: var(--surface-2);
  }

  button {
    flex: 1;
    min-height: 38px;
    padding: 0 var(--space-2);
    border-radius: 9px;
    font-size: var(--fs-small);
    font-weight: var(--fw-medium);
    color: var(--text-2);
    transition: background var(--dur) var(--ease-out), color var(--dur), box-shadow var(--dur);
  }

  button[aria-checked='true'] {
    background: var(--bg-elev);
    color: var(--text);
    box-shadow: var(--shadow-1);
  }
</style>
