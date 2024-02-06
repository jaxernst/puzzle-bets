<script lang="ts">
  import { page } from "$app/stores";
  import { getGame, userGames } from "$lib/gameStores";
  import { type GameType, GameStatus } from "$lib/types";

  import { capitalized, shortenAddress } from "$lib/util";
  import { formatEther, parseEther } from "viem";
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { ethPrice } from "$lib/ethPrice";
  import type { Entity } from "@latticexyz/recs";

  $: activeGames = $userGames.filter((g) => g.status !== GameStatus.Complete);
  $: completedGames = $userGames.filter(
    (g) => g.status === GameStatus.Complete
  );
  $: archivedGames = [];

  $: gameRoute = (id: Entity, gameType: GameType) => {
    return `/games/${gameType}/${parseInt(id, 16)}`;
  };

  const formatAsDollar = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  $: betAmount = (id: string) => {
    const weiValue = $getGame(id as Entity)?.buyInAmount ?? 0n;
    return formatAsDollar(Number(formatEther(weiValue * BigInt($ethPrice))));
  };

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
  {#each currentTabGames as { type, id, status }}
    {@const active = $page.params.gameId === parseInt(id, 16).toString()}
    <a
      class={`flex flex-col p-2 self-start rounded-lg text-white font-semibold font-mono  transition-all
          ${!active ? "bg-gray-500" : "bg-lime-500"}
        `}
      href={gameRoute(id, type)}
    >
      <div class="text-sm sm:text-base flex gap-1 items-center">
        {capitalized(type)}
        <div></div>
        <span class={`${active ? "text-white" : "text-lime-500"}`}
          >{betAmount(id)}</span
        >
      </div>
      <div
        class={`px-1 text-[.6em] sm:text-[.7em] italic whitespace-nowrap 
          ${active ? "text-lime-600 font-bold" : "text-gray-200"}`}
      >
        {#if status === GameStatus.Pending}
          waiting for opponent...
        {:else if status === GameStatus.Active}
          ready to solve...
        {:else if status === GameStatus.Complete}
          Puzzle complete
        {/if}
      </div>
    </a>
  {/each}
</div>
