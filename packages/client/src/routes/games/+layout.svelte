<script lang="ts">
  import { page } from "$app/stores";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { type GameType } from "$lib/types";
  import { encodeEntity } from "@latticexyz/store-sync/recs";
  import GameHeader from "./GameHeader.svelte";
  import type { Entity } from "@latticexyz/recs";

  // $: Game = $page.params.game[0].toUpperCase() + $page.params.game.slice(1);
  $: gameType = $page.route.id?.split("/")[2] as GameType;
  $: gameId = $page.params.gameId as Entity;
</script>

<svelte:head>
  <title>Puzzle Bets: {$page}</title>
  <meta name="description" content="Solve puzzles with friends" />
</svelte:head>

<div class="flex flex-col gap-2">
  <GameHeader {gameType} {gameId} />

  {#key $page.route.id}
    <div>
      <slot />
    </div>
  {/key}
</div>
