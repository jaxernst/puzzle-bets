<script lang="ts">
  import { userWallet } from "$lib/mud/connectWallet";
  import { mud } from "$lib/mud/mudStore";
  import { page } from "$app/stores";
  import Modal from "$lib/components/Modal.svelte";
  import { gameNumberToType, type GameType } from "$lib/types";
  import { capitalized, urlGameIdToEntity } from "$lib/util";
  import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
  import JoinGame from "./JoinGame.svelte";
  import { goto } from "$app/navigation";

  let show = true;

  $: gameId = urlGameIdToEntity($page.params.joinGameId, true);

  let gameType: GameType | undefined;
  $: if ($mud.ready && $userWallet) {
    let gameTypeVal = getComponentValue(
      $mud.components.GameType,
      gameId
    )?.value;
    if (gameTypeVal !== undefined) {
      gameType = gameNumberToType[gameTypeVal];
    }
  }
</script>

<Modal
  {show}
  on:close={() => {
    show = false;
    goto("/welcome");
  }}
>
  {#if $userWallet && $mud.ready && gameType}
    <JoinGame
      {gameId}
      on:joined={() => goto(`/games/${gameType}/${parseInt(gameId, 16)}`)}
    />
  {:else if gameType}
    Game not found
  {:else if !$userWallet}
    Connect wallet bruh
  {:else}
    Something went wrong
  {/if}
</Modal>
