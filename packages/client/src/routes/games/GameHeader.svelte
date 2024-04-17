<script lang="ts">
  import { mud  } from "$lib/mud/mudStore";
  import { user } from "$lib/user";
  import { type Entity } from "@latticexyz/recs";
  import NewGameModal from "./NewGame.svelte";
  import { GameStatus, type Game, type PuzzleType } from "$lib/types";
  import { capitalized, entityToInt } from "$lib/util";
  import Modal from "$lib/components/Modal.svelte";
  import GameResults from "./GameResults.svelte";
  import {
    liveGameStatus,
    userSolvedGame,
    type LiveStatus,
    userArchivedGames,
    gameInviteUrls,
  } from "$lib/gameStores"
  import { readable, writable, type Readable } from "svelte/store"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { puzzleStores } from "./puzzleGameStates"
  import Minus from "$lib/icons/Minus.svelte"
  import Plus from "$lib/icons/Plus.svelte"
  import { slide } from "svelte/transition"
  import { cubicOut } from "svelte/easing"

  export let gameType: PuzzleType;
  export let gameId: Entity | null = null;

  let liveStatus: Readable<LiveStatus | null> = readable(null)
  $: if (gameId) {
    liveStatus = liveGameStatus(gameId)
  } else {
    liveStatus = readable(null)
  }

  $: puzzleState = gameId && $puzzleStores[gameType].get(entityToInt(gameId))

  let showNewGameModal = false
  let showResultsModal = false

  let submitting = false
  let submitError: null | string = null
  $: submitted = gameId && $userSolvedGame(gameId, $user.address)
  const verifyAndSubmitSolution = async () => {
    if (!gameId || !$mud.systemCalls) return

    submitError = null
    submitting = true
    try {
      const res = await fetch(`/api/${gameType}/verify-user-solution`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: parseInt(gameId, 16),
          user: $user.address,
        }),
      })

      const data = await res.json()
      if (!data.won || !data.signature) {
        throw { shortMessage: "Invalid solution" }
      }

      await $mud.systemCalls.submitSolution(gameId, data.signature)
      submitted = true
    } catch (e: any) {
      console.error("Failed to submit solution")
      console.error(e)
      submitError = e.shortMessage
    } finally {
      submitting = false
    }
  }

  $: if (submitError) {
    setTimeout(() => {
      submitError = null
    }, 3000)
  }

  $: canViewResult =
    $liveStatus?.status === GameStatus.Complete ||
    $liveStatus?.submissionTimeLeft === 0 ||
    submitted ||
    puzzleState?.lost

  $: gameHidden = $userArchivedGames.some((g) => g === gameId)
  $: hideOrShowGame = () => {
    if (!gameId) return
    userArchivedGames.setArchivedState(gameId, !gameHidden)
  }

  let cancellingGame = false
  $: cancelAndArchive = async () => {
    if (!gameId || !$mud.systemCalls) return
    cancellingGame = true
    try {
      await $mud.systemCalls.cancelPendingGame(gameId)
      userArchivedGames.setArchivedState(gameId, true)
    } catch (e) {
      console.error("Failed to cancel invite")
      console.error(e)
    } finally {
      cancellingGame = false
    }
  }

  let urlCopied = false
  $: copyInviteUrl = () => {
    if (!gameId) return
    const gId = Number(entityToInt(gameId))
    let url = $gameInviteUrls[gId]
    if (!url) {
      url = gameInviteUrls.create(gameType, gId)
    }

    navigator.clipboard.writeText(url)

    urlCopied = true
    setTimeout(() => {
      urlCopied = false
    }, 1700)
  }
</script>

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false
  }}
>
  <NewGameModal {gameType} />
</Modal>

{#if gameId}
  <Modal
    show={showResultsModal}
    on:close={() => {
      showResultsModal = false
    }}
  >
    <GameResults {gameId} onClose={() => (showResultsModal = false)} />
  </Modal>
{/if}

<div class="flex flex-col px-2 text-sm sm:text-base">
  <div
    class={`flex items-center gap-2 ${
      !gameId ? "justify-center" : "justify-between"
    }`}
  >
    <div
      class={`flex-grow text-lg font-bold text-off-black
      ${!gameId ? "text-center" : ""}
    `}
    >
      {capitalized(gameType)}
      {gameId ? `#${entityToInt(gameId)}` : "(practice game)"}
    </div>

    {#if $liveStatus?.status === GameStatus.Pending}
      <button
        on:click={copyInviteUrl}
        class="whitespace-nowrap rounded-full bg-lime-500 px-2 py-1 text-sm font-semibold"
      >
        {#if urlCopied}
          <div in:slide={{ axis: "x" }}>Invite Copied!</div>
        {:else}
          <div in:slide={{ axis: "x", easing: cubicOut }}>Copy Invite</div>
        {/if}
      </button>
      <button
        class="text-sm font-semibold text-neutral-400"
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
          showResultsModal = true
        }}
        class="whitespace-nowrap rounded-full bg-lime-500 px-2 py-1 font-semibold"
      >
        View Results {puzzleState?.lost ? "" : "+ Claim"}
      </button>
    {:else if $liveStatus?.status === GameStatus.Active}
      <button
        class={`${
          submitError ? "italicx bg-red-500" : "bg-lime-500"
        } flex min-w-[70px] justify-center rounded-full px-2 py-1 font-semibold transition-all disabled:opacity-60`}
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
        class="text-sm font-semibold text-neutral-400"
      >
        {#if gameHidden}
          Unarchive
        {:else}
          Archive
        {/if}
      </button>
    {/if}
  </div>
</div>
