<script lang="ts">
  let { checked = $bindable(false), label, hint, onchange }: { checked?: boolean; label: string; hint?: string; onchange?: (v: boolean) => void } =
    $props();
</script>

<label class="row switch-row">
  <div class="row-main">
    <div class="row-title wrap">{label}</div>
    {#if hint}<div class="row-sub wrap">{hint}</div>{/if}
  </div>
  <input type="checkbox" role="switch" bind:checked onchange={() => onchange?.(checked)} />
</label>

<style>
  .switch-row {
    cursor: pointer;
  }

  .wrap {
    white-space: normal;
  }

  input {
    -webkit-appearance: none;
    appearance: none;
    flex: none;
    position: relative;
    width: 51px;
    height: 31px;
    margin: 0;
    border-radius: 16px;
    background: var(--surface-3);
    transition: background var(--dur) var(--ease-out);
    cursor: pointer;
  }

  input::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    transition: transform var(--dur) var(--ease-spring);
  }

  input:checked {
    background: var(--accent);
  }

  input:checked::after {
    transform: translateX(20px);
  }
</style>
