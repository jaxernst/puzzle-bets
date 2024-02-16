<script lang="ts">
  import { loginAndConnect } from "$lib/components/WalletConnector.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { type Entity } from "@latticexyz/recs";
  import NewGameModal from "./NewGame.svelte";
  import { GameStatus, type Game, type GameType } from "$lib/types";
  import { capitalized, entityToInt } from "$lib/util";
  import { onDestroy } from "svelte";
  import Modal from "$lib/components/Modal.svelte";
  import GameResults from "./GameResults.svelte";
  import {
    liveGameStatus,
    userSolvedGame,
    type LiveStatus,
    userArchivedGames,
    gameInviteUrls,
  } from "$lib/gameStores";
  import { readable, writable, type Readable } from "svelte/store";
  import DotLoader from "$lib/components/DotLoader.svelte";
  import { SUPPORTED_GAME_TYPES } from "$lib/constants";
  import BackArrow from "$lib/icons/BackArrow.svelte";
  import { puzzleStores } from "./puzzleGameStates";
  import Minus from "$lib/icons/Minus.svelte";
  import Plus from "$lib/icons/Plus.svelte";
  import { slide } from "svelte/transition";
  import { cubicIn, cubicInOut, cubicOut } from "svelte/easing";

  export let gameType: GameType;
  export let gameId: Entity | null = null;

  let liveStatus: Readable<LiveStatus | null> = readable(null);
  $: if (gameId) {
    liveStatus = liveGameStatus(gameId);
  }

  $: puzzleState = gameId && $puzzleStores[gameType].get(entityToInt(gameId));

  let showNewGameModal = false;
  let showResultsModal = false;

  let submitting = false;
  let submitError: null | string = null;
  $: submitted = gameId && $userSolvedGame(gameId, $user);
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

  $: canViewResult =
    $liveStatus?.status === GameStatus.Complete ||
    $liveStatus?.submissionTimeLeft === 0 ||
    submitted ||
    puzzleState?.lost;

  $: gameHidden = $userArchivedGames.some((g) => g === gameId);
  $: hideOrShowGame = () => {
    if (!gameId) return;
    userArchivedGames.setArchivedState(gameId, !gameHidden);
  };

  let cancellingGame = false;
  $: cancelAndArchive = async () => {
    if (!gameId) return;
    cancellingGame = true;
    try {
      await $mud.systemCalls.cancelPendingGame(gameId);
      userArchivedGames.setArchivedState(gameId, true);
    } catch (e) {
      console.error("Failed to cancel invite");
      console.error(e);
    } finally {
      cancellingGame = false;
    }
  };

  let urlCopied = false;
  $: copyInviteUrl = () => {
    if (!gameId) return;
    const gId = Number(entityToInt(gameId));
    let url = $gameInviteUrls[gId];
    if (!url) {
      url = gameInviteUrls.create(gameType, gId);
    }

    navigator.clipboard.writeText(url);

    urlCopied = true;
    setTimeout(() => {
      urlCopied = false;
    }, 1700);
  };
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
    <GameResults {gameId} onClose={() => (showResultsModal = false)} />
  </Modal>
{/if}

<div class="flex flex-col">
  <div class="flex justify-between items-center">
    <div
      class="flex gap-1 items-center font-mono text-sm sm:text-base text-gray-100"
    >
      {#if gameId}
        <a
          href={`/games/${gameType}/demo`}
          class="p-1 hover:scale-125 hover:fill-white transition-all"
        >
          <div class="h-5 w-5 fill-gray-100 stroke-gray-100">
            <BackArrow />
          </div>
        </a>
        {capitalized(gameType)} #{parseInt(gameId, 16)}
      {:else}
        {capitalized(gameType)} (practice)
      {/if}
    </div>

    <div class="flex gap-2 items-center text-sm sm:text-base">
      {#if !$user}
        <button
          class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
          on:click={loginAndConnect}
        >
          Connect to play
        </button>
      {:else if !gameId}
        <button
          class="bg-lime-500 rounded-full px-2 py-1 font-semibold disabled:opacity-50"
          disabled={!SUPPORTED_GAME_TYPES.includes(gameType)}
          on:click={() => (showNewGameModal = true)}
        >
          Start live game
        </button>
      {:else if $liveStatus?.status === GameStatus.Pending}
        <button
          on:click={copyInviteUrl}
          class="whitespace-nowrap self-start border border-lime-500 text-lime-500 font-semibold rounded-full px-2 py-1"
        >
          {#if urlCopied}
            <div in:slide={{ axis: "x" }}>Invite Copied!</div>
          {:else}
            <div in:slide={{ axis: "x", easing: cubicOut }}>Copy Invite</div>
          {/if}
        </button>
        <button
          class="self-start text-pb-yellow underline px-2 py-1"
          on:click={cancelAndArchive}
        >
          {#if cancellingGame}
            <DotLoader klass="fill-pb-yellow" />
          {:else}
            Cancel
          {/if}
        </button>
      {:else if canViewResult}
        <button
          on:click={() => {
            showResultsModal = true;
          }}
          class="bg-lime-500 rounded-full px-2 py-1 font-semibold whitespace-nowrap"
        >
          View Results {puzzleState?.lost ? "" : "+ Claim"}
        </button>
      {:else if $liveStatus?.status === GameStatus.Active}
        <button
          class={`${
            submitError ? "bg-red-500 italicx" : "bg-lime-500"
          } disabled:opacity-60 rounded-full px-2 py-1 font-semibold min-w-[70px] flex justify-center transition-all`}
          disabled={!puzzleState?.solved}
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
      {/if}

      {#if gameId && ($liveStatus?.status === GameStatus.Complete || $liveStatus?.status === GameStatus.Inactive)}
        <button
          on:click={hideOrShowGame}
          class="w-4 h-4 fill-gray-400 rounded border-[1.4px] border-gray-400"
        >
          {#if gameHidden}
            <Plus />
          {:else}
            <Minus />
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>
