<script lang="ts">
  import { page } from "$app/stores";
  import { ethPrice } from "$lib/ethPrice";
  import { getGame, liveGameStatus, userSolvedGame } from "$lib/gameStores";
  import { user } from "$lib/mud/mudStore";
  import { GameStatus, type Game, type GameType } from "$lib/types";
  import { capitalized, formatAsDollar } from "$lib/util";
  import type { Entity } from "@latticexyz/recs";
  import { formatEther, parseEther } from "viem";

  export let game: Game;

  $: ({ id, type, status } = game);

  $: solved = $userSolvedGame(id, $user);

  $: active = $page.params.gameId === parseInt(id, 16).toString();

  $: gameRoute = (id: Entity, gameType: GameType) => {
    return `/games/${gameType}/${parseInt(id, 16)}`;
  };

  $: betAmount = (id: string) => {
    const ethValue = Number(
      formatEther($getGame(id as Entity)?.buyInAmount ?? 0n)
    );

    return formatAsDollar(ethValue * $ethPrice);
  };
</script>

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
    {:else if status === GameStatus.Complete}
      game complete...
    {:else if solved}
      successfully solved!
    {:else if status === GameStatus.Active}
      ready to solve...
    {/if}
  </div>
</a>
