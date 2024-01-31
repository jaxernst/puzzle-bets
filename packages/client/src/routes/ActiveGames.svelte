<script lang="ts">
  import { page } from "$app/stores";
  import { getGame, userGames } from "$lib/gameStores";
  import { getComponentValueStrict, type Entity } from "@latticexyz/recs";
  import { type GameType, GameStatus } from "$lib/types";

  import { capitalized, shortenAddress } from "$lib/util";
  import { mud } from "$lib/mud/mudStore";
  import { user } from "$lib/mud/mudStore";
  import { encodeEntity } from "@latticexyz/store-sync/recs";
  import { formatEther, parseEther } from "viem";

  $: activeGames = $userGames;

  $: gameRoute = (id: Entity, gameType: GameType) => {
    return `/games/${gameType}/${parseInt(id, 16)}`;
  };

  let ethPrice = 2400;

  const formatAsDollar = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  $: betAmount = (id: string) => {
    const weiValue = $getGame(id as Entity)?.buyInAmount ?? 0n;
    return formatAsDollar(Number(formatEther(weiValue * BigInt(ethPrice))));
  };
</script>

<div class="font-mono text-gray-100">
  <span class="text-lime-400">{activeGames.length}</span> Live Games
</div>
{#if activeGames.length}
  <div class="flex overflow-auto gap-1 no-scrollbar items-center">
    {#each activeGames as { type, p1, p2, id, opponent, status }}
      {@const active = $page.params.gameId === parseInt(id, 16).toString()}
      <a
        class={`flex flex-col p-2 self-start rounded-lg text-white font-semibold font-mono  transition-all
          ${!active ? "bg-gray-500" : "bg-lime-500"}
        `}
        href={gameRoute(id, type)}
      >
        <div class="flex gap-1 items-center">
          {capitalized(type)}
          <span class={`text-sm ${active ? "text-lime-600" : "text-lime-500"}`}
          ></span>
          <span class={`${active ? "text-white" : "text-lime-500"}`}
            >{betAmount(id)}</span
          >
        </div>
        <div
          class={`px-1 text-[.7em] italic whitespace-nowrap 
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
{/if}
