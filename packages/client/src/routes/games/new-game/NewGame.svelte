<script context="module" lang="ts">
  import { derived, writable } from "svelte/store"
  import { mud } from "$lib/mud/mudStore"

  export type NewGameParams = {
    puzzleType: PuzzleType
    wagerEth: number
    submissionWindow: number
    inviteExpiration: number
  }

  export let createGame = () => {
    const params = writable<Partial<NewGameParams>>({})
    const loading = writable()
    const error = writable()

    const paramsValid = ({
      puzzleType,
      wagerEth,
      submissionWindow,
      inviteExpiration,
    }: Partial<NewGameParams>) => {
      return (
        puzzleType &&
        wagerEth !== undefined &&
        submissionWindow &&
        inviteExpiration
      )
    }

    const createGame = derived([params, mud], ([$params, $mud]) => {
      return async () => {
        if (!$mud.systemCalls) return
        if (!paramsValid($params)) {
          error.set("Invalid parameters")
        }

        const {
          gameType,
          wagerEth,
          submissionWindowMinutes,
          inviteExpirationMinutes,
        } = $params as NewGameParams

        loading.set(true)

        try {
          await $mud.systemCalls.newGame(
            gameType,
            wagerEth,
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
    })

    return {
      setParam: params,
      create: create,
    }
  }
</script>

<script lang="ts">
  import type { PuzzleType } from "$lib/types"

  import { ethPrice } from "$lib/ethPrice"
  import { capitalized } from "$lib/util"
  import InputPage from "./InputPage.svelte"
  import ConfirmPage from "./ConfirmPage.svelte"

  export let gameType: PuzzleType

  // Game params
  let wagerUSD: number = 2.5
  let wagerETH: number = wagerUSD / $ethPrice
  let submissionWindowMinutes = 8
  let inviteExpirationMinutes = 20
  let inviteName: string | null = null

  let showConfirm = false
</script>

<div class="flex max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-5">
  <div class="font-semibold">
    Create a new <span class="text-lime-500">{capitalized(gameType)}</span> Game
  </div>

  <div class="text-sm text-neutral-100">
    Enter your wager then send an invite link to your opponent. When they join
    the game, the puzzle will be revealed and the deadline clock will start
    ticking.
  </div>

  {#if showConfirm}
    <ConfirmPage {gameType} />
  {:else}
    <InputPage {gameType} onConfirm={() => showConfirm} />
  {/if}
</div>
