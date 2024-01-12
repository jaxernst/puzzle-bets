<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { userGames } from "$lib/gameStores";
  import { getComponentValueStrict, type Entity } from "@latticexyz/recs";
  import { type GameType } from "$lib/types";
  import { capitalized } from "$lib/util";
  import { mud } from "$lib/mud/mudStore";
  import { user } from "$lib/mud/mudStore";
  import { encodeEntity } from "@latticexyz/store-sync/recs";
  import { formatEther, parseEther } from "viem";

  $: activeGames = $userGames;

  $: gameRoute = (id: Entity, gameType: GameType) => {
    return `/games/${gameType}/${parseInt(id, 16)}`;
  };

  let ethPrice = 2400;

  const formatAsDollar = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  $: betAmount = (id: string) => {
    if (!$user) throw "Invariant error";

    const weiValue = getComponentValueStrict(
      $mud.components.Deposit,
      encodeEntity(
        { gameId: "bytes32", player: "address" },
        { gameId: id as `0x${string}`, player: $user }
      )
    ).value;

    return formatAsDollar(Number(formatEther(weiValue * BigInt(ethPrice))));
  };
</script>

<div class="font-mono text-gray-100">
  <span class="text-lime-400">{activeGames.length}</span> Active Games
</div>
{#if activeGames.length}
  <div class="flex gap-2 items-center">
    {#each activeGames as { type, p1, p2, id }}
      {@const active = $page.params.gameId === parseInt(id, 16).toString()}
      <a
        class={`flex gap-1 items-center px-3 py-2 self-start  rounded-lg text-white font-semibold text-center transition-all
          ${!active ? "" : "bg-lime-500"}
        `}
        href={gameRoute(id, type)}
      >
        {capitalized(type)}
        <span class={`text-sm ${active ? "text-lime-600" : "text-lime-500"}`}
          >{@html "&#9670;"}</span
        >
        {betAmount(id)}
        <span class="font-bold text-lg"></span>
      </a>
    {/each}
  </div>
{/if}
