<script lang="ts">
  import { liveGameStatus, userGames, userSolvedGame } from "$lib/gameStores";
  import { entityToInt, formatTime, shortenAddress } from "$lib/util";
  import { type Entity } from "@latticexyz/recs";
  import { formatEther } from "viem";
  import { ethPrice } from "$lib/ethPrice";
  import { user } from "$lib/mud/mudStore";
  import { puzzleStores } from "./puzzleGameStates";
  import { GameStatus } from "$lib/types";

  export let gameId: Entity;

  $: game = $userGames.find((g) => {
    return g.id === gameId;
  });

  $: liveStatus = liveGameStatus(gameId);

  $: betAmountEth = Number(formatEther(game?.buyInAmount ?? 0n));
  $: betAmountUsd = betAmountEth * $ethPrice;

  $: dueIn = $liveStatus?.submissionTimeLeft;
  $: puzzleState = game && $puzzleStores[game.type]?.get(entityToInt(gameId));

  $: statusLabels = {
    0: () => "Game cancelled. All funds have been returned.",
    1: () => {
      if ($liveStatus?.inviteTimeLeft === 0) {
        return "Invite expired. Click cancel to withdraw funds and archive game.";
      }
      return `Waiting for opponent to accept invite...`;
    },
    2: () => {
      if ($userSolvedGame(gameId, $user)) {
        if (dueIn !== undefined && dueIn > 0) {
          return `Solution Received! Check back in ${formatTime(
            dueIn
          )} to claim rewards...`;
        } else {
          return "Solution received!";
        }
      } else if (dueIn !== undefined && dueIn > 0) {
        if (puzzleState?.lost) {
          return "Better luck next time...";
        }
        return `Puzzle due in ${formatTime(dueIn)}`;
      } else if (dueIn === 0) {
        return "Time's up. No solution received...";
      }
    },
    3: () => "Completed",
  };
</script>

{#if game}
  <div class="flex flex-col gap-2 sm:gap-3 px-2">
    <div class="text-neutral-500 font-semibold text-sm italic">
      {#if statusLabels[game.status]()}
        {statusLabels[game.status]()}
      {/if}
    </div>
    {#if dueIn !== undefined && dueIn > 0}
      <div class="text-neutral-500 text-sm italic">
        * Win by being the sole player to solve + submit before the deadline
      </div>
    {/if}

    <div class="text-sm flex gap-4 items-stretch">
      <div
        class="flex flex-col justify-evenly gap-1 font-semibold text-lime-500"
      >
        <div class="">Wager</div>
        <div class="">Opponent</div>
      </div>
      <div class="flex flex-col justify-evenly gap-1 text-neutral-500">
        <div>
          ${betAmountUsd.toFixed(2)}
        </div>
        <div>
          {#if game.opponent}
            {shortenAddress(game?.opponent)}
          {:else}
            tbd
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
