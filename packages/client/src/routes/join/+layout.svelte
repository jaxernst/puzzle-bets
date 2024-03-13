<script lang="ts">
  import { mud } from "$lib/mud/mudStore";
  import { page } from "$app/stores";
  import Modal from "$lib/components/Modal.svelte";
  import { systemTimestamp, intToEntity } from "$lib/util";
  import JoinGame from "./JoinGame.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { loginAndConnect } from "$lib/components/WalletConnector.svelte";
  import { user } from "$lib/mud/mudStore";
  import { getGame } from "$lib/gameStores";
  import { GameStatus } from "$lib/types";
  import DotLoader from "$lib/components/DotLoader.svelte";

  let show = true;

  onMount(() => {
    if (!$user) {
      loginAndConnect();
    }
  });

  $: gameId = isNaN(parseInt($page.params.joinGameId))
    ? null
    : intToEntity($page.params.joinGameId, true);

  $: game = gameId && $getGame(gameId);
  $: userIsEligible = $user && $user !== game?.p1;

  let inviteExpired = false;
  const checkInviteExpired = (inviteExpirationTime: bigint) => {
    const tDiff = Number(inviteExpirationTime) - systemTimestamp();
    if (tDiff <= 0) inviteExpired = true;
  };

  let intervalTimer: any;
  $: if (game && !intervalTimer) {
    checkInviteExpired(game.inviteExpiration);
    intervalTimer = setInterval(
      () => checkInviteExpired(game!.inviteExpiration),
      1000
    );
  }
</script>

{#if $user}
  <Modal
    {show}
    on:close={() => {
      show = false;
      goto("/welcome");
    }}
  >
    <div
      class="relative bg-neutral-800 text-neutral-200 p-6 rounded-xl flex flex-col gap-2 max-w-[450px]"
    >
      {#if !$mud.ready}
        <div class="self-center">
          <DotLoader klass="fill-neutral-200" />
        </div>
        <div class="self-center text-neutral-400 text-xs">
          Syncing blockchain state...
        </div>
      {:else if !gameId || !game}
        Game not found
      {:else if !userIsEligible}
        You are not elligible for this game
      {:else if inviteExpired || game?.status === GameStatus.Inactive}
        Game invite expired
      {:else if game?.status === GameStatus.Active || game?.status === GameStatus.Complete}
        Game already started!
      {:else}
        <JoinGame
          {gameId}
          on:joined={() => goto(`/games/${game?.type}/${parseInt(gameId, 16)}`)}
        />
      {/if}

      <a class="absolute right-2 top-0 text-neutral-400" href={"/welcome"}>x</a>
    </div>
  </Modal>
{/if}

<slot />
