<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import DotLoader from "$lib/components/DotLoader.svelte";
  import { ethPrice } from "$lib/ethPrice";
  import { gameInviteUrls } from "$lib/gameStores";
  import EthSymbol from "$lib/icons/EthSymbol.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import type { GameType } from "$lib/types";
  import { capitalized } from "$lib/util";
  import { HasValue, runQuery } from "@latticexyz/recs";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";
  import { notifications } from "$lib/notifications/notificationStore";
  import NotificationBell from "$lib/icons/NotificationBell.svelte";

  export let gameType: GameType;

  // Game params
  let wagerETH: number = 0.001;
  let wagerUSD: number = wagerETH * $ethPrice;
  let submissionWindowMinutes = 8;
  let inviteExpirationMinutes = 20;
  let inviteName: string | null = null;

  function updateETH(value: number) {
    wagerETH = value;
    wagerUSD = wagerETH * $ethPrice;
  }

  function updateUSD(value: number) {
    wagerUSD = value;
    wagerETH = wagerUSD / $ethPrice;
  }

  let createGameLoading = false;
  let gameCreated = false;
  let createGameError: string | null = null;
  async function createGame() {
    createGameError = null;
    createGameLoading = true;
    try {
      await $mud.systemCalls.newGame(
        gameType,
        wagerETH,
        submissionWindowMinutes,
        inviteExpirationMinutes
      );
      gameCreated = true;
    } catch (e: any) {
      console.error(e);
      createGameError =
        "Game creation failed with:" + e.shortMessage ?? "unkown error";
    } finally {
      createGameLoading = false;
    }
  }

  let createdGameId: number | null = null;
  $: if (gameCreated && browser) {
    const entities = runQuery([
      HasValue($mud.components.Player1, { value: $user }),
    ]);

    const sorted = Array.from(entities).sort(
      (a, b) => parseInt(a, 16) - parseInt(b, 16)
    );

    const newest = sorted[sorted.length - 1];

    if (newest) {
      createdGameId = parseInt(newest, 16);
      gameInviteUrls.create(gameType, createdGameId, wagerUSD, inviteName);
    }
  }

  // Go to the game page (doesn't close modal)
  $: if (createdGameId) {
    goto(`/games/${gameType}/${createdGameId}`);
  }

  let inviteCopied = false;
  async function copyInviteUrl() {
    const inviteUrl =
      typeof createdGameId === "number" && $gameInviteUrls[createdGameId];
    if (!inviteUrl) throw new Error("No invite url");

    try {
      await navigator.clipboard.writeText(inviteUrl);
      inviteCopied = true;
      setTimeout(() => (inviteCopied = false), 1800);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
</script>

<div class="bg-neutral-800 p-5 rounded-xl flex flex-col gap-2 max-w-[450px]">
  <div class="font-semibold">
    Create a new <span class="text-lime-500">{capitalized(gameType)}</span> Game
  </div>
  <div class="text-sm text-neutral-100">
    Enter your wager then send an invite link to your opponent. When they join
    the game, the puzzle will be revealed and the deadline clock will start
    ticking.
  </div>
  <div
    class="py-2 px-3 sm:px-6 flex justify-between items-center text-neutral-400"
  >
    <label class="flex flex-col gap-1 text-neutral-200">
      <span class="text-sm text-neutral-400">Wager (ETH)</span>
      <div class="flex items-center gap-1">
        <input
          type="number"
          min="0.000"
          step="0.001"
          class="bg-neutral-700 rounded-lg p-2 w-[120px]"
          placeholder="0.01"
          value={wagerETH}
          on:input={(event) => updateETH(parseFloat(event.target.value))}
        />
        <div class="w-4 h-4 fill-neutral-300">
          <EthSymbol />
        </div>
      </div>
    </label>
    <div class="">or</div>
    <label class="flex flex-col gap-1 text-neutral-200">
      <span class="text-sm text-neutral-400">Wager (USD)</span>
      <div class="flex items-center gap-1">
        <input
          type="number"
          min="5"
          step="1"
          class="bg-neutral-700 rounded-lg p-2 w-[120px]"
          placeholder="15"
          value={wagerUSD}
          on:input={(event) => updateUSD(parseFloat(event.target.value))}
        />
        <div class=" fill-neutral-300">$</div>
      </div>
    </label>
  </div>

  <div class="py-2 px-6 flex flex-col gap-3">
    <div class="text-neutral-400">
      Puzzle deadline:
      <input
        type="number"
        class="bg-neutral-700 text-neutral-200 px-2 rounded-lg w-[50px]"
        min="1"
        max="100000"
        bind:value={submissionWindowMinutes}
      /> minutes
    </div>

    <div class="text-neutral-400">
      Invite expires:
      <input
        type="number"
        class="bg-neutral-700 text-neutral-200 px-2 rounded-lg w-[50px]"
        min="1"
        max="100000"
        bind:value={inviteExpirationMinutes}
      />
      minutes
    </div>

    <div class="text-neutral-400">
      Your name (optional):
      <input
        type="text"
        class="border-2 border-neutral-500 bg-transparent text-neutral-200 px-2 rounded-lg w-[130px]"
        bind:value={inviteName}
        on:input|preventDefault|stopPropagation
      />
    </div>
  </div>

  <div class="self-center p-4">
    {#key [createGameLoading, gameCreated, inviteCopied]}
      <button
        class="bg-lime-500 hover:bg-lime-400 whitespace-nowrap hover:shadow-lg transition-all active:bg-lime-600 rounded-lg font-bold px-3 py-2"
        on:click={() => (!gameCreated ? createGame() : copyInviteUrl())}
        in:slide={{ axis: "x", easing: cubicOut }}
      >
        {#if createGameLoading}
          <DotLoader />
        {:else if inviteCopied}
          Invite Copied!
        {:else if gameCreated}
          <div>Success! Click to copy invite link</div>
        {:else}
          Create Game & Generate Invite
        {/if}
      </button>
    {/key}
  </div>
  {#if createGameError}
    <div class="text-red-500 text-sm">{createGameError}</div>
  {/if}

  {#if gameCreated && !$notifications.enabled}
    <div
      class="whitespace-nowrap text-xs sm:text-base self-center flex items-center gap-2 text-neutral-400 fill-neutral-400"
    >
      Click the
      <div class="w-4 h-4"><NotificationBell /></div>
      to get notified when your opponent joins
    </div>
  {/if}
</div>
