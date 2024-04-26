<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { getGame, liveGameStatus } from "$lib/gameStores"
  import { mud } from "$lib/mud/mudStore"
  import { ethPrice } from "$lib/ethPrice"
  import {
    capitalized,
    formatAsDollar,
    formatTime,
    shortenAddress,
    systemTimestamp,
  } from "$lib/util"
  import { type Entity } from "@latticexyz/recs"
  import { createEventDispatcher, onMount } from "svelte"
  import { slide } from "svelte/transition"
  import { cubicInOut } from "svelte/easing"
  import { formatEther } from "viem"

  export let gameId: Entity

  $: game = $getGame(gameId)
  $: gameType = game?.type

  const dispatch = createEventDispatcher()

  let joinGameLoading = false
  const joinGame = async () => {
    if (!game || !$mud.systemCalls) return

    const pw =
      new URLSearchParams(window.location.search).get("pw") ?? undefined

    // TODO: Display proper error when password is incorrect
    joinGameLoading = true
    try {
      await $mud.systemCalls.joinGame(
        gameId,
        Number(formatEther(game?.buyInAmount)),
        pw,
      )

      dispatch("joined")

      fetch(`/api/notifications/${game.p1}/notify-game-joined`, {
        method: "POST",
      })
    } finally {
      joinGameLoading = false
    }
  }

  $: liveStatus = liveGameStatus(gameId)
</script>

{#if game && gameType}
  <div class="flex max-w-[450px] flex-col">
    <div class="font-semibold">
      Join <span class="text-lime-500">{capitalized(gameType)}</span> Game #{parseInt(
        gameId,
        16,
      )}
    </div>

    {#if $liveStatus?.inviteTimeLeft !== undefined}
      <div
        class="min-w-[270px] whitespace-nowrap italic text-neutral-400"
        in:slide={{ axis: "x", easing: cubicInOut }}
      >
        Invite expires in {formatTime($liveStatus.inviteTimeLeft)}...
      </div>
    {/if}

    {#if gameType === "wordle"}
      <ul class="flex list-disc flex-col gap-2 px-4 pb-2 pt-4 text-sm">
        <li>
          Be the sole player to solve and submit the Wordle before the deadline
        </li>

        <li>Vote to rematch in the event of a tie</li>
      </ul>
    {/if}

    <div class="px-1 py-4 text-sm text-neutral-100">
      <div class="flex gap-4">
        <div class="flex flex-col gap-1 text-neutral-400">
          <div class="">Game Creator</div>
          <div class="">Bet Amount</div>
          <div class="">Solution Deadline</div>
        </div>
        <div class="flex flex-col gap-1 text-neutral-100">
          <div class="">{shortenAddress(game.p1)}</div>
          <div class="">
            {#if $ethPrice}
              {formatAsDollar(
                Number(formatEther(game.buyInAmount)) * $ethPrice,
              )}
            {:else}
              {formatEther(game.buyInAmount)} eth
            {/if}
          </div>
          <div class="">
            {Math.round(game.submissionWindow / 60)}<span>{" "}minutes</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-2 flex justify-center px-4">
      {#key joinGameLoading}
        <button
          in:slide={{ axis: "x" }}
          class="whitespace-nowrap rounded-lg bg-lime-500 p-2 text-white transition-all hover:bg-lime-400 hover:shadow"
          on:click={joinGame}
        >
          {#if joinGameLoading}
            <DotLoader />
          {:else}
            Join to Reveal Puzzle
          {/if}
        </button>
      {/key}
    </div>
  </div>
{/if}
