<script lang="ts">
  import { loginAndConnect } from "$lib/components/WalletConnector.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { type Entity, getComponentValue } from "@latticexyz/recs";
  import NewGameModal from "./NewGame.svelte";
  import { GameStatus, type Game, type GameType } from "$lib/types";
  import { capitalized } from "$lib/util";
  import { onDestroy } from "svelte";
  import Modal from "$lib/components/Modal.svelte";
  import GameResults from "./GameResults.svelte";
  import {
    getGame,
    liveGameStatus,
    userSolvedGame,
    type LiveStatus,
  } from "$lib/gameStores";
  import { readable, writable, type Readable } from "svelte/store";
  import DotLoader from "$lib/components/DotLoader.svelte";
  import { slide } from "svelte/transition";

  export let gameType: GameType;
  export let gameId: Entity | null = null;

  let liveStatus: Readable<LiveStatus | null> = readable(null);
  $: if (gameId) {
    liveStatus = liveGameStatus(gameId);
  }

  let showNewGameModal = false;
  let showResultsModal = false;

  let submitting = false;
  let submitError: null | string = null;
  $: submitted = gameId && $userSolvedGame(gameId);
  const verifyAndSubmitSolution = async () => {
    if (!gameId) return;

    submitError = null;
    submitting = true;
    try {
      const res = await fetch(`/api/${gameType}/verify-user-solution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: parseInt(gameId, 16),
          user: $user,
        }),
      });

      const data = await res.json();
      if (!data.won || !data.signature) {
        throw { shortMessage: "Invalid solution" };
      }

      await $mud.systemCalls.submitSolution(gameId, data.signature);
      submitted = true;
    } catch (e: any) {
      console.error("Failed to submit solution");
      console.error(e);
      submitError = e.shortMessage;
    } finally {
      submitting = false;
    }
  };

  $: if (submitError) {
    setTimeout(() => {
      submitError = null;
    }, 3000);
  }

  $: console.log($liveStatus);
</script>

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false;
  }}
>
  <NewGameModal {gameType} />
</Modal>

{#if gameId}
  <Modal
    show={showResultsModal}
    on:close={() => {
      showResultsModal = false;
    }}
  >
    <GameResults {gameId} />
  </Modal>
{/if}

<div class="flex flex-col">
  <div class="flex justify-between items-center">
    <div class="font-mono text-lg text-gray-100">
      {#if gameId}
        {capitalized(gameType)} game #{parseInt(gameId, 16)}
      {:else}
        {capitalized(gameType)}
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      {#if !$user}
        <button
          class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
          on:click={loginAndConnect}
        >
          Connect to play
        </button>
      {:else if !gameId}
        <button
          class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
          on:click={() => (showNewGameModal = true)}
        >
          Start live game
        </button>
      {:else if $liveStatus?.status}
        {#if $liveStatus?.status === GameStatus.Complete}
          <button
            on:click={() => {
              showResultsModal = true;
            }}
            class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
          >
            View Results + Claim
          </button>
        {:else if $liveStatus.status && $liveStatus?.status === GameStatus.Active}
          {#if !submitted}
            <button
              class={`${
                submitError ? "bg-red-500 italicx" : "bg-lime-500"
              } rounded-full px-2 py-1 font-semibold min-w-[70px] flex justify-center transition-all`}
              on:click={verifyAndSubmitSolution}
            >
              {#if submitting}
                <DotLoader />
              {:else if submitError}
                {submitError}
              {:else}
                Submit
              {/if}
            </button>
          {:else}
            <div class="text-lime-500 font-bold">Solution Received!</div>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
</div>
