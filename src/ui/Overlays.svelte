<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import Icon from './Icon.svelte';
  import { portal, trapFocus } from './actions';
  import { overlays, dismissToast } from './overlay.svelte';
  import { dur } from '../lib/motion';
</script>

{#each overlays.dialogs as d (d.id)}
  <div class="layer" use:portal>
    {#if d.kind === 'confirm'}
      <div class="backdrop" transition:fade={{ duration: dur(180) }} aria-hidden="true" onclick={() => d.resolve(false)}></div>
      <div
        class="alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-{d.id}"
        tabindex="-1"
        use:trapFocus
        onkeydown={(e) => e.key === 'Escape' && d.resolve(false)}
        transition:scale={{ start: 0.94, duration: dur(200), easing: cubicOut }}
      >
        <h2 id="alert-{d.id}">{d.title}</h2>
        {#if d.message}<p>{d.message}</p>{/if}
        <div class="alert-buttons">
          <button class="btn" onclick={() => d.resolve(false)}>{d.cancelLabel}</button>
          <button class="btn" class:btn-danger={d.destructive} class:btn-primary={!d.destructive} onclick={() => d.resolve(true)}>
            {d.confirmLabel}
          </button>
        </div>
      </div>
    {:else}
      <div class="backdrop" transition:fade={{ duration: dur(180) }} aria-hidden="true" onclick={() => d.resolve(null)}></div>
      <div
        class="actions"
        role="dialog"
        aria-modal="true"
        aria-label={d.title ?? 'Aktionen'}
        tabindex="-1"
        use:trapFocus
        onkeydown={(e) => e.key === 'Escape' && d.resolve(null)}
        transition:fly={{ y: 300, duration: dur(260), easing: cubicOut, opacity: 1 }}
      >
        <div class="group">
          {#if d.title}<div class="actions-title">{d.title}</div>{/if}
          {#each d.items as item (item.id)}
            <button class="row action" class:destructive={item.destructive} onclick={() => d.resolve(item.id)}>
              {#if item.icon}<Icon name={item.icon} size={22} />{/if}
              <span>{item.label}</span>
            </button>
          {/each}
        </div>
        <button class="group cancel" onclick={() => d.resolve(null)}>Abbrechen</button>
      </div>
    {/if}
  </div>
{/each}

<div class="toasts" use:portal aria-live="polite">
  {#each overlays.toasts as t (t.id)}
    <div class="toast" transition:fly={{ y: 16, duration: dur(220) }}>
      <span>{t.text}</span>
      {#if t.action}
        <button
          onclick={() => {
            t.action!.run();
            dismissToast(t.id);
          }}>{t.action.label}</button
        >
      {/if}
    </div>
  {/each}
</div>

<style>
  .layer {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: grid;
    place-items: center;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: var(--backdrop);
  }

  .alert {
    position: relative;
    width: min(320px, calc(100% - 48px));
    padding: var(--space-6) var(--space-5) var(--space-4);
    background: var(--bg-elev);
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-2);
    text-align: center;
  }

  .alert h2 {
    font-size: var(--fs-h3);
    font-weight: var(--fw-semibold);
    line-height: var(--lh-snug);
  }

  .alert p {
    margin-top: var(--space-2);
    color: var(--text-2);
    font-size: var(--fs-small);
    line-height: var(--lh-snug);
  }

  .alert-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
    margin-top: var(--space-5);
  }

  .alert-buttons .btn {
    padding: 0 var(--space-3);
  }

  .actions {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: 520px;
    margin: 0 auto;
    padding: 0 var(--space-3) calc(var(--space-3) + var(--safe-bottom));
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .actions-title {
    padding: var(--space-3) var(--space-4);
    font-size: var(--fs-caption);
    color: var(--text-2);
    text-align: center;
    border-bottom: 0.5px solid var(--line-strong);
  }

  .action {
    justify-content: center;
    color: var(--accent);
    min-height: 56px;
    font-size: var(--fs-body);
  }

  .action.destructive {
    color: var(--bad);
  }

  .cancel {
    min-height: 56px;
    font-weight: var(--fw-semibold);
    color: var(--accent);
  }

  .toasts {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(var(--safe-bottom) + var(--tabbar-h) + 20px);
    z-index: 300;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    pointer-events: none;
  }

  .toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    max-width: calc(100% - 40px);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-full);
    background: var(--text);
    color: var(--bg);
    font-size: var(--fs-small);
    box-shadow: var(--shadow-2);
  }

  .toast button {
    color: var(--bg);
    font-weight: var(--fw-semibold);
    text-decoration: underline;
    text-underline-offset: 3px;
    min-height: 32px;
  }
</style>
