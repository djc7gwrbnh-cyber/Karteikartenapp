<script lang="ts">
  import StudySession from './StudySession.svelte';
  import Summary from './Summary.svelte';
  import { study } from './study.svelte';
  import { router } from '../../app/router.svelte';

  $effect(() => {
    if (!study.active && !study.finished) router.go('/', { replace: true });
  });
</script>

{#if study.finished}
  <Summary result={study.finished} />
{:else if study.active}
  {#key study.active.id}
    <StudySession session={study.active} />
  {/key}
{/if}
