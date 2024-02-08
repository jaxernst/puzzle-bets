<script lang="ts">
  import { getGame, userGames } from "$lib/gameStores";
  import { type GameType, GameStatus } from "$lib/types";

  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import GamePreviewCard from "./GamePreviewCard.svelte";

  $: activeGames = $userGames.filter((g) => g.status !== GameStatus.Complete);
  $: completedGames = $userGames.filter(
    (g) => g.status === GameStatus.Complete
  );
  $: archivedGames = [];

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
</script>

<div
  class="flex gap-3 font-mono text-gray-100 text-sm transition-all duration-500"
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
</div>

<div class="mt-1 flex overflow-auto gap-1 no-scrollbar items-center">
  {#each currentTabGames as game}
    <GamePreviewCard {game} />
  {/each}
</div>
