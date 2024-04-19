<script context="module" lang="ts">
  import { derived, writable } from "svelte/store"
  import { mud } from "$lib/mud/mudStore"

  export type NewGameParams = {
    puzzleType: PuzzleType
    wagerEth: number
    submissionWindow: number
    inviteExpiration: number
  }

  export let NewGameStore = (() => {
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
        if (!$mud.systemCalls) {
          return error.set("Mud not setup")
        }
        if (!paramsValid($params)) {
          return error.set("Invalid parameters")
        }

        const { puzzleType, wagerEth, submissionWindow, inviteExpiration } =
          $params as NewGameParams

        loading.set(true)

        try {
          await $mud.systemCalls.newGame(
            puzzleType,
            wagerEth,
            submissionWindow,
            inviteExpiration,
          )
        } catch (e: any) {
          console.error(e)
          error.set(
            "Game creation failed with:" + e.shortMessage ?? "unkown error",
          )
        } finally {
          loading.set(false)
        }
      }
    })

    return {
      ...derived([params, loading, error], ([params, loading, error]) => ({
        ...params,
        loading,
        error,
      })),

      setParam: <T extends keyof NewGameParams>(
        param: keyof NewGameParams,
        value: NewGameParams[T],
      ) => {
        params.update((s) => ({ ...s, [param]: value }))
      },

      create: createGame,
    }
  })()
</script>

<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"
  import InputPage from "./InputPage.svelte"
  import ConfirmPage from "./ConfirmPage.svelte"
  import { loadConfigFromFile } from "vite"

  export let puzzleType: PuzzleType

  let showConfirm = false

  $: NewGameStore.setParam("puzzleType", puzzleType)
</script>

<div class="flex max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-5">
  <div class="font-semibold">
    Create a new <span class="text-lime-500">{capitalized(puzzleType)}</span> Game
  </div>

  {#if showConfirm}
    <ConfirmPage />
  {:else}
    <div class="text-sm text-neutral-100">
      Enter your wager then send an invite link to your opponent. When they join
      the game, the puzzle will be revealed and the deadline clock will start
      ticking.
    </div>

    <InputPage onConfirm={() => showConfirm} />
  {/if}
</div>
