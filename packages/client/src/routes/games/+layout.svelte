<script lang="ts">
  import { page } from "$app/stores";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { type GameType } from "$lib/types";
  import { encodeEntity } from "@latticexyz/store-sync/recs";
  import GameHeader from "./GameHeader.svelte";
  import {
    getComponentValueStrict,
    type Entity,
    getComponentValue,
  } from "@latticexyz/recs";
  import GameHud from "./GameHud.svelte";
  import { numberToHex, padHex, toBytes } from "viem";
  import { userGames } from "$lib/gameStores";

  const urlGameIdToEntity = (id: string) => {
    return padHex(numberToHex(BigInt(id)), { size: 32 }) as Entity;
  };

  // $: Game = $page.params.game[0].toUpperCase() + $page.params.game.slice(1);
  $: gameType = $page.route.id?.split("/")[2] as GameType;
  $: gameId = urlGameIdToEntity($page.params.gameId);
  $: gameStatus = getComponentValue($mud.components.GameStatus, gameId)?.value;
</script>

<svelte:head>
  <title>Puzzle Bets: {$page}</title>
  <meta name="description" content="Solve puzzles with friends" />
</svelte:head>

<div class="flex flex-col gap-2">
  <GameHeader {gameType} {gameId} />

  {#if gameId}
    <div class="self-start">
      <GameHud {gameId} />
    </div>
  {/if}

  {#key $page.route.id}
    <div>
      <slot />
    </div>
  {/key}
</div>
