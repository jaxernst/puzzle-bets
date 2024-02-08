<script lang="ts">
  import { getGame, userArchivedGames, userGames } from "$lib/gameStores";
  import { type GameType, GameStatus } from "$lib/types";

  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import GamePreviewCard from "./GamePreviewCard.svelte";
  import { user } from "$lib/mud/mudStore";
  import Expand from "$lib/icons/Expand.svelte";
  import { flip } from "svelte/animate";

  $: nonArchivedGames = $userGames.filter(
    (g) => !$userArchivedGames.includes(g.id)
  );

  $: activeGames = nonArchivedGames.filter(
    (g) => g.status !== GameStatus.Complete
  );
  $: completedGames = nonArchivedGames.filter(
    (g) => g.status === GameStatus.Complete
  );

  $: archivedGames = $userGames.filter((g) =>
    $userArchivedGames.includes(g.id)
  );

  let selectedTab: "live" | "completed" | "archived" = "live";

  $: currentTabGames = (() => {
    switch (selectedTab) {
      case "live":
        return activeGames;
      case "completed":
        return completedGames;
      case "archived":
        return archivedGames;
    }
  })();

  let expandedView = false;
</script>

<div
  class="flex gap-3 items-center font-mono text-gray-100 text-sm transition-all duration-500"
>
  <button
    on:click={() => (selectedTab = "live")}
    class={`flex transition-all duration-200 ${
      selectedTab === "live" ? "" : "opacity-50"
    }`}
  >
    {#if selectedTab === "live"}
      <span
        transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
        class="text-lime-400 min-w-0 pr-2">{activeGames.length}</span
      >
    {/if}
    Live Games
  </button>

  <div class="text-gray-500">|</div>

  <button
    on:click={() => (selectedTab = "completed")}
    class={`flex transition-all duration-200 ${
      selectedTab === "completed" ? "" : "opacity-50"
    }`}
  >
    {#if selectedTab === "completed"}
      <span
        transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
        class="text-lime-400 min-w-0 pr-2">{completedGames.length}</span
      >
    {/if}
    Completed
  </button>

  <div class="text-gray-500">|</div>

  <button
    on:click={() => (selectedTab = "archived")}
    class={`flex transition-all duration-200 ${
      selectedTab === "archived" ? "" : "opacity-50"
    }`}
  >
    {#if selectedTab === "archived"}
      <span
        transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
        class="text-lime-400 min-w-0 pr-2">{archivedGames.length}</span
      >
    {/if}
    Archived
  </button>

  <div class="flex-grow flex justify-end items-center">
    <button
      class="p-1 flex items-center"
      on:click={() => (expandedView = !expandedView)}
    >
      <div
        class={`h-4 w-4 stroke-gray-400 ${
          expandedView ? "rotate-180" : "rotate-90"
        } transition-transform`}
      >
        <Expand />
      </div>
    </button>
  </div>
</div>

<div
  class={`mt-1 flex gap-1 no-scrollbar items-center ${
    expandedView ? "flex-wrap" : "overflow-auto"
  }`}
>
  {#each currentTabGames as game (game.id)}
    <div animate:flip>
      <GamePreviewCard {game} />
    </div>
  {/each}
</div>
