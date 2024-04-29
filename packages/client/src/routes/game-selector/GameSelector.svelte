<script lang="ts">
  import {
    lobbyGames,
    userArchivedGames,
    userGames as userGameStore,
  } from "$lib/gameStores"
  import { type PuzzleType, GameStatus, type Game } from "$lib/types"

  import { slide } from "svelte/transition"
  import { cubicInOut, cubicOut, sineInOut } from "svelte/easing"
  import GamePreviewCard from "./GamePreviewCard.svelte"
  import Expand from "$lib/icons/Expand.svelte"
  import { flip } from "svelte/animate"
  import { page } from "$app/stores"
  import { entityToInt, intToEntity } from "$lib/util"
  import { clickOutside } from "$lib/actions/clickOutside"
  import { spring } from "svelte/motion"
  import PublicGameCard from "./PublicGameCard.svelte"

  $: userGames = $userGameStore.reduce<{
    active: Game[]
    completed: Game[]
    archived: Game[]
  }>(
    (acc, game) => {
      if ($userArchivedGames.includes(game.id)) {
        return { ...acc, archived: [...acc.archived, game] }
      }

      if (
        game.status === GameStatus.Complete ||
        game.status === GameStatus.Inactive
      ) {
        return { ...acc, completed: [...acc.completed, game] }
      }

      return { ...acc, active: [...acc.active, game] }
    },
    { active: [], completed: [], archived: [] },
  )

  let selectedTab: "lobby" | "live" | "completed" | "archived" = "live"

  $: gameId = $page.params.gameId && intToEntity($page.params.gameId)
  $: gameIdTab = userGames.archived.some((g) => g.id === gameId)
    ? "archived"
    : userGames.completed.some((g) => g.id === gameId)
    ? "completed"
    : userGames.active.some((g) => g.id === gameId)
    ? "live"
    : "live"

  $: selectedTab = gameIdTab as any

  $: currentTabGames = (() => {
    switch (selectedTab) {
      case "lobby":
        return $lobbyGames
      case "live":
        return userGames.active
      case "completed":
        return userGames.completed
      case "archived":
        return userGames.archived
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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="flex flex-col gap-2 rounded-t-xl bg-neutral-800 px-1 pt-2 font-semibold"
  style={`height: ${$height}px`}
  use:clickOutside={{
    enabled: expandedView,
    cb: () => (expandedView = false),
  }}
  on:click={() => (expandedView = true)}
>
  <div
    class={`flex cursor-pointer items-center gap-2 pl-2  text-[.82rem] transition-all duration-500 sm:gap-3`}
  >
    <button
      on:click={() => (selectedTab = "lobby")}
      class={`flex py-1 text-lime-500 transition-all duration-200 ${
        selectedTab === "lobby" ? "" : "opacity-50"
      }`}
    >
      Lobby
      {#if $lobbyGames.length > 0}
        <div
          class="ml-[.14rem] h-1.5 w-1.5 animate-pulse rounded-full bg-lime-500"
        />
      {/if}
    </button>

    <div class="text-neutral-500">|</div>

    <button
      on:click={() => (selectedTab = "live")}
      class={`flex py-1 transition-all duration-200 ${
        selectedTab === "live" ? "" : "opacity-50"
      }`}
    >
      {#if selectedTab === "live"}
        <span
          transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
          class="min-w-0 pr-2 font-bold text-lime-500"
          >{userGames.active.length}</span
        >
      {/if}
      Live Games
    </button>

    <div class="text-neutral-500">|</div>

    <button
      on:click={() => (selectedTab = "completed")}
      class={`flex py-1 transition-all duration-200 ${
        selectedTab === "completed" ? "" : "opacity-50"
      }`}
    >
      {#if selectedTab === "completed"}
        <span
          transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
          class="min-w-0 pr-2 text-lime-400">{userGames.completed.length}</span
        >
      {/if}
      Completed
    </button>

    <div class="text-neutral-500">|</div>

    <button
      on:click={() => (selectedTab = "archived")}
      class={`flex py-1 transition-all duration-200 ${
        selectedTab === "archived" ? " " : "opacity-50"
      }`}
    >
      {#if selectedTab === "archived"}
        <span
          transition:slide={{ axis: "x", duration: 200, easing: cubicOut }}
          class="min-w-0 pr-2 text-lime-400">{userGames.archived.length}</span
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

  <div
    class="flex items-center gap-2 px-2 text-sm font-normal text-neutral-300"
  >
    {#if selectedTab === "lobby"}
      <span class="ptext-base font-semibold text-lime-500"
        >{$lobbyGames.length}</span
      >
      public {$lobbyGames.length === 1 ? "game" : "games"} available to join
    {/if}
  </div>

  <div class="overflow-y-auto px-2">
    <div
      class={`no-scrollbar mt-1 grid w-full grid-cols-2 gap-1 sm:grid-cols-3`}
    >
      {#each currentTabGames as game (game.id)}
        <div animate:flip={{ duration: 650, easing: cubicInOut }}>
          {#if "public" in game}
            <PublicGameCard {game} />
          {:else}
            <GamePreviewCard {game} />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
