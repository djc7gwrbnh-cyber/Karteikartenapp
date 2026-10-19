<script lang="ts">
  import type { FinishedSession } from './study.svelte';
  import { study } from './study.svelte';
  let { result }: { result: FinishedSession } = $props();
</script>

<div class="summary">
  <h1>Geschafft!</h1>
  <p>{result.record.total} Karten</p>
  <button class="btn btn-primary" onclick={() => study.close()}>Fertig</button>
</div>
