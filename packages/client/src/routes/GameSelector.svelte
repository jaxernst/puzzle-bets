<script lang="ts">
  import { userArchivedGames, userGames } from "$lib/gameStores";
  import { type GameType, GameStatus } from "$lib/types";

  import { slide } from "svelte/transition";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import GamePreviewCard from "./GamePreviewCard.svelte";
  import Expand from "$lib/icons/Expand.svelte";
  import { flip } from "svelte/animate";
  import { page } from "$app/stores";
  import { intToEntity } from "$lib/util";

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

  $: gameId = $page.params.gameId && intToEntity($page.params.gameId);
  $: gameIdTab = archivedGames.some((g) => g.id === gameId)
    ? "archived"
    : completedGames.some((g) => g.id === gameId)
      ? "completed"
      : activeGames.some((g) => g.id === gameId)
        ? "live"
        : "live";

  $: selectedTab = gameIdTab as any;

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
  class="flex gap-2 sm:gap-3 items-center font-mono text-off-black text-xs sm:text-sm transition-all duration-500"
>
  <button
    on:click={() => (selectedTab = "live")}
    class={`flex transition-all duration-200 py-1 rounded-lg ${
      selectedTab === "live" ? "bg-gray-500 text-white px-2" : ""
    }`}
  >
    {#if selectedTab === "live"}
      <span
        transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
        class="text-lime-500 font-bold min-w-0 pr-2">{activeGames.length}</span
      >
    {/if}
    Live Games
  </button>

  <div class="text-gray-500">|</div>

  <button
    on:click={() => (selectedTab = "completed")}
    class={`flex transition-all duration-200 py-1 rounded-lg ${
      selectedTab === "completed" ? "bg-gray-500 text-white px-2" : ""
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
    class={`flex transition-all duration-200 py-1 rounded-lg ${
      selectedTab === "archived" ? "bg-gray-500 text-white px-2" : ""
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
      class="pb-[.2rem] flex items-center"
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
    <div animate:flip={{ duration: 650, easing: cubicInOut }}>
      <GamePreviewCard {game} />
    </div>
  {/each}
</div>
