import { wordleGameCacheKey } from "$lib/server/gameCacheKeys"
import { supabaseGameStore } from "$lib/server/gameStateStorage.js"
import type { EvmAddress } from "$lib/types"
import { Game } from "../../../../lib/server/wordle/game"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ locals, request, cookies }) => {
  const { gameId, otherPlayer, chainRematchCount, isDemo } =
    (await request.json()) as {
      gameId: string
      isDemo?: boolean
      otherPlayer?: string
      chainRematchCount?: number
    }

  const user = locals.user as EvmAddress | undefined
  if (!user && !isDemo) return new Response("No user", { status: 401 })

  if (!gameId) return new Response("Missing game ID", { status: 400 })

  const gameExists = await supabaseGameStore.hasGame(
    "wordle",
    gameId,
    user,
    isDemo,
  )

  if (!gameExists) return new Response("No game to reset", { status: 400 })

  // Clear cookie cache for game
  const cachedGame = cookies.get(wordleGameCacheKey(gameId))
  if (cachedGame) {
    cookies.delete(wordleGameCacheKey(gameId), { path: "/" })
  }

  // gameId's that are onchain (have an associated bet) can only be reset when
  // both players vote to reset. Will need to verify both players have voted
  // and reset each players game state
  // TODO: check if both players have voted
  // TODO: get 'otherPlayer' with a contract read
  // TODO: get 'chainRematchCount' with a contract read

  const game = new Game()
  if (isDemo) {
    await supabaseGameStore.setGame(
      game.toString(),
      "wordle",
      gameId,
      user,
      isDemo,
    )
  } else {
    if (!chainRematchCount) {
      return new Response("Missing chainRematchCount", { status: 400 })
    }
    const success = await supabaseGameStore.resetDuelGame(
      gameId,
      game.toString(),
      chainRematchCount,
    )
    if (!success) {
      return new Response("Game not resetable", { status: 403 })
    }
  }

  return new Response(
    JSON.stringify({
      gameId: gameId,
      guesses: [],
      answers: [],
      solved: false,
      lost: false,
      answer: null,
      badGuess: false,
      resetCount: chainRematchCount,
    }),
  )
}
