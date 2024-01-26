<script lang="ts">
  import { userWallet } from "$lib/mud/connectWallet";
  import { mud } from "$lib/mud/mudStore";
  import { page } from "$app/stores";
  import Modal from "$lib/components/Modal.svelte";
  import { gameNumberToType, type GameType } from "$lib/types";
  import { capitalized, systemTimestamp, urlGameIdToEntity } from "$lib/util";
  import { getComponentValue, getComponentValueStrict } from "@latticexyz/recs";
  import JoinGame from "./JoinGame.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import {
    loginAndConnect,
    promptConnectWallet,
  } from "$lib/components/WalletConnector.svelte";
  import { user } from "$lib/mud/mudStore";

  let show = true;

  onMount(() => {
    if (!$user) {
      loginAndConnect();
    }
  });

  $: gameId = urlGameIdToEntity($page.params.joinGameId, true);

  let gameType: GameType | undefined;
  let gameExpired: boolean = false;
  $: if ($mud.ready && $userWallet) {
    let gameTypeVal = getComponentValue(
      $mud.components.GameType,
      gameId
    )?.value;

    if (gameTypeVal !== undefined) {
      gameType = gameNumberToType[gameTypeVal];
    }

    const gameExpiration = Number(
      getComponentValueStrict($mud.components.InviteExpiration, gameId)?.value
    );
    gameExpired = systemTimestamp() > gameExpiration;
  }
</script>

{#if $user && $mud.ready}
  <Modal
    {show}
    on:close={() => {
      show = false;
      goto("/welcome");
    }}
  >
    <div
      class="relative bg-gray-600 text-gray-200 p-6 rounded-xl flex flex-col gap-2 max-w-[450px]"
    >
      {#if $userWallet && $mud.ready && gameType && !gameExpired}
        <JoinGame
          {gameId}
          on:joined={() => goto(`/games/${gameType}/${parseInt(gameId, 16)}`)}
        />
      {:else if !gameType}
        Game not found
      {:else if gameExpired}
        Game expired
      {:else}
        Something went wrong
      {/if}

      <a class="absolute right-2 top-0 text-gray-400" href={"/welcome"}>x</a>
    </div>
  </Modal>
{/if}
