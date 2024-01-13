<script lang="ts">
  import { page } from "$app/stores";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { GameStatus, type GameType } from "$lib/types";
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
  import { urlGameIdToEntity } from "$lib/util";

  $: gameType = $page.route.id?.split("/")[2] as GameType;
  $: gameId = urlGameIdToEntity($page.params.gameId);

  $: gameStatus =
    gameId &&
    getComponentValueStrict($mud.components.GameStatus, gameId)?.value;
</script>

<svelte:head>
  <title>Puzzle Bets: {$page}</title>
  <meta name="description" content="Solve puzzles with friends" />
</svelte:head>

<div class="flex flex-col flex-grow gap-3">
  <GameHeader {gameType} {gameId} />

  {#if gameId}
    <div class="self-start">
      <GameHud {gameId} />
    </div>
  {/if}

  {#key $page.route.id}
    {#if gameStatus === GameStatus.Pending}
      <div
        class="flex flex-col gap-4 grow text-center justify-center items-center font-bold px-6 pb-10"
      >
        The puzzle will reveal for both players once the invite is accepted
        <div class="text-gray-300 text-sm italic">
          Invites expire in 15 minutes...
        </div>
      </div>
    {:else}
      <div>
        <slot />
      </div>
    {/if}
  {/key}
</div>
