import { derived, get, writable, type Readable } from "svelte/store"
import { mud } from "$lib/mud/mudStore"
import type { PuzzleType } from "$lib/types"

export type NewGameParams = {
  puzzleType: PuzzleType
  wagerEth: number
  submissionWindow: number
  inviteExpiration: number
}

export const DEFAULT_PARAMS: NewGameParams = {
  puzzleType: "wordle",
  wagerEth: 0.001,
  submissionWindow: 8 * 60,
  inviteExpiration: 20 * 60,
}

const paramsValid = ({
  puzzleType,
  wagerEth,
  submissionWindow,
  inviteExpiration,
}: Partial<NewGameParams>) => {
  return (
    puzzleType &&
    wagerEth !== undefined &&
    (submissionWindow ?? 0) > 0 &&
    (inviteExpiration ?? 0) > 0
  )
}

function makeNewGameStore(initialParams: NewGameParams) {
  const params = writable<NewGameParams>(initialParams)
  const loading = writable()
  const error = writable()

  const createGame = async () => {
    const $params = get(params)
    const $mud = get(mud)

    if (!$mud.systemCalls) return error.set("Mud not setup")
    if (!paramsValid($params)) return error.set("Invalid parameters")

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
        "Game creation failed with: " + (e.shortMessage ?? "unkown error"),
      )
      throw e
    } finally {
      loading.set(false)
    }
  }

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
}

export const newGame = makeNewGameStore(DEFAULT_PARAMS)
