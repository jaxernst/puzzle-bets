<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { ethPrice } from "$lib/ethPrice"
  import { getGame, liveGameStatus, userSolvedGame } from "$lib/gameStores"
  import { mud } from "$lib/mud/mudStore"
  import { user } from "$lib/user"
  import { GameStatus, type StartedGame } from "$lib/types"
  import {
    entityToInt,
    formatAsDollar,
    formatTime,
    weiToDollar,
  } from "$lib/util"
  import type { Entity } from "@latticexyz/recs"
  import { slide } from "svelte/transition"
  import { formatEther } from "viem"
  import { puzzleStores } from "./puzzleGameStates"

  export let gameId: Entity
  export let onClaimed = () => {}
  export let onClose = () => {}

  $: game = $getGame(gameId, { expectStarted: true }) as StartedGame
  $: userPuzzleState = $puzzleStores[game.type]?.get(entityToInt(gameId))

  $: potSizeUsd = Number(formatEther(game.buyInAmount * 2n)) * $ethPrice

  $: liveStatus = liveGameStatus(gameId)

  $: p1Submitted = $userSolvedGame(gameId, game?.p1)
  $: p2Submitted = $userSolvedGame(gameId, game?.p2)

  $: playerResults = (p: "1" | "2") => {
    const addr = p === "1" ? game.p1 : game.p2
    const submitted = p === "1" ? p1Submitted : p2Submitted
    if (submitted) return "✅"
    if ($user.address === addr && userPuzzleState?.lost) return "❌"
    return ($liveStatus?.submissionTimeLeft ?? 0) > 0 ? "(pending)" : "❌"
  }

  $: p1Results = playerResults("1")
  $: p2Results = playerResults("2")

  $: gameActive = ($liveStatus?.submissionTimeLeft ?? 0) > 0
  $: gameOutcome = (() => {
    if (p1Submitted && p2Submitted) return "tie"
    if (($liveStatus?.submissionTimeLeft ?? 0) > 0) return null

    if (!p1Submitted && !p2Submitted) return "tie"
    if (p1Submitted) return $user.address === game.p1 ? "won" : "lost"
    if (p2Submitted) return $user.address === game.p2 ? "won" : "lost"
    return null
  })()

  $: userBalance = $user.address === game.p1 ? game.p1Balance : game.p2Balance
  $: opponentBalance =
    $user.address === game.p1 ? game.p2Balance : game.p1Balance
  $: claimed = Boolean(
    game.buyInAmount && gameOutcome !== "lost" && userBalance === 0n,
  )
  $: opponentClaimed = Boolean(
    game.buyInAmount && gameOutcome !== "won" && opponentBalance === 0n,
  )

  let claimLoading = false
  let claimError: string | null = null
  $: claim = async () => {
    if (!$mud.systemCalls) return

    claimLoading = true
    claimError = null
    try {
      await $mud.systemCalls.claim(gameId)
      onClaimed()
    } catch (e: any) {
      console.error(e)
      claimError = e.shortMessage ?? "error occurred"
    } finally {
      claimLoading = false
    }
  }

  $: [userVotedRematch, opponentVotedRematch] =
    $user.address === game.p1
      ? [game.p1Rematch, game.p2Rematch]
      : [game.p2Rematch, game.p1Rematch]

  let startingRematchCount: number | null = null
  $: if (startingRematchCount === null && game) {
    startingRematchCount = game.rematchCount
  }

  // If the rematch count changes, the game was reset, so close out of the results
  $: if (
    startingRematchCount !== null &&
    game.rematchCount !== startingRematchCount
  ) {
    onClose?.()
  }

  let voteRematchLoading = false
  let voteRematchError: null | string = null
  $: voteRematch = async () => {
    if (!$mud.systemCalls) return

    voteRematchLoading = true
    voteRematchError = null
    try {
      const willTriggerRematch = opponentVotedRematch
      await $mud.systemCalls.voteRematch(gameId)

      if (willTriggerRematch) {
        fetch(`/api/notifications/${game.p1}/notify-game-rematch`, {
          method: "POST",
        })
      }
    } catch (e: any) {
      console.error(e)
      voteRematchError = e.shortMessage ?? "error occurred"
    } finally {
      voteRematchLoading = false
    }
  }
</script>

<div
  class="flex min-w-[350px] max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-5"
>
  <div class="flex flex-col gap-7 font-semibold">
    <div class="flex items-center justify-between gap-5">
      <div class="">Game #{parseInt(gameId, 16)} Results</div>
      <div
        class="self-center rounded-xl border border-lime-500 px-3 py-1 text-lime-500"
      >
        ${potSizeUsd.toFixed(2)} pot
      </div>
    </div>
    <div class=" self-center text-sm">
      <div
        class={`grid justify-items-center ${
          game.p1Rematch || game.p2Rematch
            ? "grid-cols-[auto_1fr_1fr_1fr]"
            : "grid-cols-[auto_1fr_1fr]"
        } gap-3`}
      >
        <div></div>
        <div class="justify-self-center text-sm font-bold text-neutral-400">
          Solved
        </div>
        <div class="justify-self-center text-sm font-bold text-neutral-400">
          Balance
        </div>
        {#if game.p1Rematch || game.p2Rematch}
          <div class="justify-self-center text-sm font-bold text-neutral-400">
            Rematch
          </div>
        {/if}

        <div class="">
          Player 1 {$user.address === game.p1 ? "(you)" : ""}
        </div>
        <div class="justify-self-center">{p1Results}</div>
        <div class="justify-self-center">
          {weiToDollar(game.p1Balance, $ethPrice)}
        </div>
        {#if game.p1Rematch || game.p2Rematch}
          <div class="justify-self-center">{game.p1Rematch ? "✅" : ""}</div>
        {/if}

        <div class="">
          Player 2 {$user.address === game.p2 ? "(you)" : ""}
        </div>
        <div class="justify-self-center">{p2Results}</div>
        <div class="justify-self-center">
          {weiToDollar(game.p2Balance, $ethPrice)}
        </div>
        {#if game.p2Rematch || game.p1Rematch}
          <div class="justify-self-center">{game.p2Rematch ? "✅" : ""}</div>
        {/if}
      </div>
    </div>

    <div class="flex flex-col items-center gap-1 p-3">
      {#if gameOutcome === "lost"}
        <span class="text-pb-yellow">
          You lost :( Your opponent won the pot
        </span>
      {:else if gameOutcome === "won"}
        <button
          class={`self-center whitespace-nowrap rounded-lg bg-lime-500 p-2 ${
            claimed ? "opacity-50" : ""
          }`}
          disabled={claimed}
          on:click={claim}
          in:slide={{ axis: "x" }}
        >
          {#if claimLoading}
            <DotLoader />
          {:else if claimed || game.status === GameStatus.Complete}
            {formatAsDollar(potSizeUsd)} claimed!
          {:else}
            You won! Click to claim your winnings
          {/if}
        </button>
      {:else if gameOutcome === "tie"}
        {#if !claimed && !opponentClaimed}
          <button
            class={`self-center whitespace-nowrap rounded-lg bg-lime-500 p-2 ${
              userVotedRematch ? "opacity-50" : ""
            }`}
            disabled={userVotedRematch}
            on:click={voteRematch}
            in:slide={{ axis: "x" }}
          >
            {#if voteRematchLoading}
              <DotLoader />
            {:else if userVotedRematch}
              Voted to rematch
            {:else}
              It's a tie! Vote to rematch?
            {/if}
          </button>
          <span class="text-sm text-neutral-400">or</span>
        {/if}
        <button
          class={`border-pb-yellow self-center whitespace-nowrap rounded-lg border p-2 text-neutral-100 ${
            claimed ? "opacity-50" : ""
          }`}
          disabled={claimed}
          on:click={claim}
          in:slide={{ axis: "x" }}
        >
          {#if claimLoading}
            <DotLoader class="fill-neutral-100" />
          {:else if claimed}
            {formatAsDollar(potSizeUsd / 2)} claimed!
          {:else if !game.buyInAmount}
            Finalize Game
          {:else}
            Withdraw wager
          {/if}
        </button>
      {/if}

      {#if $liveStatus?.submissionTimeLeft && !gameOutcome}
        <div class="text-sm italic text-neutral-400">
          {formatTime($liveStatus.submissionTimeLeft)} remaining...
        </div>
      {/if}
    </div>
    {#if claimError || voteRematchError}
      <div class="text-sm text-red-500">{claimError ?? voteRematchError}</div>
    {/if}
  </div>
</div>
