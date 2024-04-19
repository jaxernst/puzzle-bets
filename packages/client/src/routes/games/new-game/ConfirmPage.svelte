<script lang="ts">
  import { browser } from "$app/environment"
  import { goto } from "$app/navigation"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { ethPrice } from "$lib/ethPrice"
  import { gameInviteUrls } from "$lib/gameStores"
  import { mud } from "$lib/mud/mudStore"
  import { user } from "$lib/user"
  import type { PuzzleType } from "$lib/types"
  import { HasValue, runQuery } from "@latticexyz/recs"
  import { cubicOut } from "svelte/easing"
  import { slide } from "svelte/transition"
  import { notifications } from "$lib/notifications/notificationStore"
  import NotificationBell from "$lib/icons/NotificationBell.svelte"
  import InputPage from "./InputPage.svelte"
  import ConfirmPage from "./ConfirmPage.svelte"

  export let gameType: PuzzleType

  // Game params
  let wagerUSD: number = 2.5
  let wagerETH: number = wagerUSD / $ethPrice
  let submissionWindowMinutes = 8
  let inviteExpirationMinutes = 20
  let inviteName: string | null = null

  let createGameLoading = false
  let gameCreated = false
  let createGameError: string | null = null
  async function createGame() {
    if (!$mud.systemCalls) return

    createGameError = null
    createGameLoading = true
    try {
      await $mud.systemCalls.newGame(
        gameType,
        wagerETH,
        submissionWindowMinutes,
        inviteExpirationMinutes,
      )
      gameCreated = true
    } catch (e: any) {
      console.error(e)
      createGameError =
        "Game creation failed with:" + e.shortMessage ?? "unkown error"
    } finally {
      createGameLoading = false
    }
  }

  let createdGameId: number | null = null
  $: if (gameCreated && browser && $mud.components) {
    const entities = runQuery([
      HasValue($mud.components.Player1, { value: $user.address }),
    ])

    const sorted = Array.from(entities).sort(
      (a, b) => parseInt(a, 16) - parseInt(b, 16),
    )

    const newest = sorted[sorted.length - 1]

    if (newest) {
      createdGameId = parseInt(newest, 16)
      gameInviteUrls.create(gameType, createdGameId, wagerUSD, inviteName)
    }
  }

  // Go to the game page (doesn't close modal)
  $: if (createdGameId) {
    goto(`/games/${gameType}/${createdGameId}`)
  }

  let inviteCopied = false
  async function copyInviteUrl() {
    const inviteUrl =
      typeof createdGameId === "number" && $gameInviteUrls[createdGameId]
    if (!inviteUrl) throw new Error("No invite url")

    try {
      await navigator.clipboard.writeText(inviteUrl)
      inviteCopied = true
      setTimeout(() => (inviteCopied = false), 1800)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }
</script>

<div class="self-center p-4">
  {#key [createGameLoading, gameCreated, inviteCopied]}
    <button
      class="whitespace-nowrap rounded-lg bg-lime-500 px-3 py-2 font-bold transition-all hover:bg-lime-400 hover:shadow-lg active:bg-lime-600"
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
  <div class="text-sm text-red-500">{createGameError}</div>
{/if}

{#if createdGameId}
  <div class="w-full text-center text-lime-500">
    Game Id: {createdGameId}
  </div>
{/if}

{#if gameCreated && !$notifications.enabled}
  <div
    class="flex items-center gap-2 self-center whitespace-nowrap fill-neutral-400 text-xs text-neutral-400 sm:text-base"
  >
    Click the
    <div class="h-4 w-4"><NotificationBell /></div>
    to get notified when your opponent joins
  </div>
{/if}
