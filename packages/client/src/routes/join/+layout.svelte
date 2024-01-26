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
  import { loginAndConnect } from "$lib/components/WalletConnector.svelte";
  import { user } from "$lib/mud/mudStore";
  import { getGame } from "$lib/gameStores";

  let show = true;

  onMount(() => {
    if (!$user) {
      loginAndConnect();
    }
  });

  $: gameId = urlGameIdToEntity($page.params.joinGameId, true);
  $: game = $getGame(gameId);
  $: userIsEligible = $user && $user !== game?.p1;

  let inviteExpired = false;
  onMount(() =>
    setInterval(() => {
      if (!game) return;

      const tDiff = Number(game.inviteExpiration) - systemTimestamp();
      if (tDiff <= 0) inviteExpired = true;
    }, 1000)
  );
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
      {#if !game}
        Game not found
      {:else if !userIsEligible}
        You are not elligible for this game
      {:else if inviteExpired}
        Game inviteExpired
      {:else}
        <JoinGame
          {gameId}
          on:joined={() => goto(`/games/${game?.type}/${parseInt(gameId, 16)}`)}
        />
      {/if}

      <a class="absolute right-2 top-0 text-gray-400" href={"/welcome"}>x</a>
    </div>
  </Modal>
{/if}