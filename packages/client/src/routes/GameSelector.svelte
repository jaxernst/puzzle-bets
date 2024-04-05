<script lang="ts">
  import { userArchivedGames, userGames } from "$lib/gameStores"
  import { type GameType, GameStatus } from "$lib/types"

  import { slide } from "svelte/transition"
  import { cubicInOut, cubicOut, sineInOut } from "svelte/easing"
  import GamePreviewCard from "./GamePreviewCard.svelte"
  import Expand from "$lib/icons/Expand.svelte"
  import { flip } from "svelte/animate"
  import { page } from "$app/stores"
  import { entityToInt, intToEntity } from "$lib/util"
  import { clickOutside } from "$lib/actions/clickOutside"
  import { spring, tweened } from "svelte/motion"

  $: nonArchivedGames = $userGames.filter(
    (g) => !$userArchivedGames.includes(g.id),
  )

  $: activeGames = nonArchivedGames.filter(
    (g) => g.status !== GameStatus.Complete,
  )

  $: completedGames = nonArchivedGames.filter(
    (g) => g.status === GameStatus.Complete,
  )

  $: archivedGames = $userGames.filter((g) => $userArchivedGames.includes(g.id))

  let selectedTab: "live" | "completed" | "archived" = "live"

  $: gameId = $page.params.gameId && intToEntity($page.params.gameId)
  $: gameIdTab = archivedGames.some((g) => g.id === gameId)
    ? "archived"
    : completedGames.some((g) => g.id === gameId)
      ? "completed"
      : activeGames.some((g) => g.id === gameId)
        ? "live"
        : "live"

  $: selectedTab = gameIdTab as any

  $: currentTabGames = (() => {
    switch (selectedTab) {
      case "live":
        return activeGames
      case "completed":
        return completedGames
      case "archived":
        return archivedGames
    }
  })().sort((a, b) => {
    return Number(entityToInt(b.id)) - Number(entityToInt(a.id))
  })

  let expandedView = false

  const height = spring(0, {
    stiffness: 0.066,
    damping: 0.39,
    precision: 0.001,
  })

  $: if (expandedView) {
    $height = 260
  } else {
    $height = 65
  }
</script>

<div
  class="flex flex-col gap-2 rounded-t-xl bg-neutral-800 px-1.5 pt-2 text-[.82rem] font-semibold sm:text-sm"
  style={`height: ${$height}px`}
  use:clickOutside={{
    enabled: expandedView,
    cb: () => (expandedView = false),
  }}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class={`flex cursor-pointer items-center gap-2 pl-2 transition-all duration-500 sm:gap-3`}
    on:click={() => (expandedView = true)}
  >
    <button
      on:click={() => (selectedTab = "live")}
      class={`flex rounded-lg py-1 transition-all duration-200 ${
        selectedTab === "live" ? "" : "opacity-50"
      }`}
    >
      {#if selectedTab === "live"}
        <span
          transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
          class="min-w-0 pr-2 font-bold text-lime-500"
          >{activeGames.length}</span
        >
      {/if}
      Live Games
    </button>

    <div class="text-neutral-500">|</div>

    <button
      on:click={() => (selectedTab = "completed")}
      class={`flex rounded-lg py-1 transition-all duration-200 ${
        selectedTab === "completed" ? "" : "opacity-50"
      }`}
    >
      {#if selectedTab === "completed"}
        <span
          transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
          class="min-w-0 pr-2 text-lime-400">{completedGames.length}</span
        >
      {/if}
      Completed
    </button>

    <div class="text-neutral-500">|</div>

    <button
      on:click={() => (selectedTab = "archived")}
      class={`flex rounded-lg py-1 transition-all duration-200 ${
        selectedTab === "archived" ? " " : "opacity-50"
      }`}
    >
      {#if selectedTab === "archived"}
        <span
          transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
          class="min-w-0 pr-2 text-lime-400">{archivedGames.length}</span
        >
      {/if}
      Archived
    </button>

    <div class="flex flex-grow items-center justify-end">
      <button
        class="flex items-center p-1 pb-1.5"
        on:click|stopPropagation={() => (expandedView = !expandedView)}
      >
        <div
          class={`h-4 w-4 stroke-neutral-400 ${
            expandedView ? "rotate-180" : ""
          } transition-transform`}
        >
          <Expand />
        </div>
      </button>
    </div>
  </div>

  <div class="overflow-y-auto px-2">
    <div
      class={`no-scrollbar mt-1 grid w-full grid-cols-2 gap-1 sm:grid-cols-3`}
    >
      {#each currentTabGames as game (game.id)}
        <div animate:flip={{ duration: 650, easing: cubicInOut }}>
          <GamePreviewCard {game} />
        </div>
      {/each}
    </div>
  </div>
</div>
