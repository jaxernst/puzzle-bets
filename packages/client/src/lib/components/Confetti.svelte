<script context="module">
  import { browser } from "$app/environment";
  import { prefersReducedMotion } from "$lib/accessibility";
  import { confetti } from "@neoconfetti/svelte";
  import { writable } from "svelte/store";

  const trigger = writable(0);

  export const launchConfetti = () => {
    trigger.update((n) => n + 1);
  };

  let stageWidth = 800;
  let stageHeight = 2000;
  if (browser) {
    stageWidth = window.innerWidth;
    stageHeight = window.innerHeight;
  }
</script>

{#key $trigger}
  {#if $trigger}
    <div
      style="position: absolute; left: 50%; top: 30%"
      use:confetti={{
        particleCount: $prefersReducedMotion ? 0 : undefined,
        force: 0.7,
        stageWidth,
        stageHeight,
        colors: ["#EACB28", "#40b3ff", "#676778", "rgb(132, 204, 22)"],
      }}
    />
  {/if}
{/key}
