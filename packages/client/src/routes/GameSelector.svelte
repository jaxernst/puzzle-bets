<script lang="ts">
  import { userArchivedGames, userGames } from "$lib/gameStores";
  import { type GameType, GameStatus } from "$lib/types";

  import { slide } from "svelte/transition";
  import { cubicInOut, cubicOut, sineInOut } from "svelte/easing";
  import GamePreviewCard from "./GamePreviewCard.svelte";
  import Expand from "$lib/icons/Expand.svelte";
  import { flip } from "svelte/animate";
  import { page } from "$app/stores";
  import { intToEntity } from "$lib/util";
  import { clickOutside } from "$lib/actions/clickOutside";
  import { spring, tweened } from "svelte/motion";

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

  const height = spring(0, {
    stiffness: 0.07,
    damping: 0.32,
    precision: 0.005,
  });

  $: if (expandedView) {
    $height = 260;
  } else {
    $height = 65;
  }
</script>

<div
  class="flex flex-col gap-2 bg-gray-600 px-1.5 pt-2 rounded-t-xl text-[.82rem] sm:text-sm font-semibold"
  style={`height: ${$height}px`}
  use:clickOutside={{
    enabled: expandedView,
    cb: () => (expandedView = false),
  }}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class={`flex gap-2 sm:gap-3 items-center cursor-pointer transition-all duration-500 pl-2`}
    on:click={() => (expandedView = true)}
  >
    <button
      on:click={() => (selectedTab = "live")}
      class={`flex transition-all duration-200 py-1 rounded-lg ${
        selectedTab === "live" ? "" : "opacity-50"
      }`}
    >
      {#if selectedTab === "live"}
        <span
          transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
          class="text-lime-500 font-bold min-w-0 pr-2"
          >{activeGames.length}</span
        >
      {/if}
      Live Games
    </button>

    <div class="text-gray-500">|</div>

    <button
      on:click={() => (selectedTab = "completed")}
      class={`flex transition-all duration-200 py-1 rounded-lg ${
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
      class={`flex transition-all duration-200 py-1 rounded-lg ${
        selectedTab === "archived" ? " " : "opacity-50"
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
        class="p-1 pb-1.5 flex items-center"
        on:click|stopPropagation={() => (expandedView = !expandedView)}
      >
        <div
          class={`h-4 w-4 stroke-gray-400 ${
            expandedView ? "rotate-180" : ""
          } transition-transform`}
        >
          <Expand />
        </div>
      </button>
    </div>
  </div>

  <div class="overflow-y-auto">
    <div class={`mt-1 flex flex-wrap gap-1 no-scrollbar`}>
      {#each currentTabGames as game (game.id)}
        <div animate:flip={{ duration: 650, easing: cubicInOut }}>
          <GamePreviewCard {game} />
        </div>
      {/each}
    </div>
  </div>
</div>
