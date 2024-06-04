import { networkConfig } from "$lib/mud/networkConfig"
import { publicClient, worldContract } from "$lib/mud/setupNetwork"
import { wordleGameCacheKey } from "$lib/server/gameCacheKeys"
import { getGameResetCount } from "$lib/server/gameStateStorage"
import type { EvmAddress } from "$lib/types"
import { resourceToHex, resourceTypeIds } from "@latticexyz/common"
import { Game } from "../../../../lib/server/wordle/game"
import { getOrCreateDemo, getOrCreateLiveGame } from "./getOrCreate"
import { entityToHexKeyTuple } from "@latticexyz/store-sync/recs"
import { intToEntity } from "$lib/util"

export const POST = async ({ request, cookies, locals }): Promise<Response> => {
  const { gameId, opponent, isDemo } = (await request.json()) as {
    gameId: string
    // Temporarily get the opponent from the client as a param.
    // TODO: Query the smart contracts to get opponent for security (client can't
    // be trusted to provided the correct opponent)
    isDemo?: boolean
    opponent?: string
  }

  const user = locals.user
  if (!user && !isDemo) return new Response("No user", { status: 401 })

  const Player1 = resourceToHex({
    type: "table",
    namespace: "v1",
    name: "Player1"
  })

  const Player2 = resourceToHex({
    type: "table",
    namespace: "v1",
    name: "Player2"
  })
  

  // Check for gameId and verify opponent
  const p1Lookup = await worldContract.read.getField([
    Player1, // Resource identifier
    entityToHexKeyTuple(intToEntity(parseInt(gameId), true)), // Key tuple (not sure how to get/format this)
    0
  ])

  const p2Lookup = await worldContract.read.getField([
    Player2, // Resource identifier
    entityToHexKeyTuple(intToEntity(parseInt(gameId), true)), // Key tuple (not sure how to get/format this)
    0
  ])

  console.log(p1Lookup, p2Lookup)
  console.log(user)

  let inputParamsValid = true
  if (!isDemo) {
    if (user.toLowerCase() === p1Lookup) {
      if (opponent?.toLowerCase() !== p2Lookup) inputParamsValid = false 
    } else if (user.toLowerCase() === p2Lookup) {
      if (opponent?.toLowerCase() !== p1Lookup) inputParamsValid = false
    } else {
      inputParamsValid = false
    }
  }

  if (!inputParamsValid) return new Response(null, { status: 400 })

  if (!isDemo && !(opponent && user)) {
    return new Response("Missing parameter", { status: 400 })
  }

  if (!gameId) return new Response("Missing game ID", { status: 400 })

  const cachedGame = cookies.get(wordleGameCacheKey(gameId))

  let game: Game
  if (cachedGame) {
    game = new Game(cachedGame)
  } else if (isDemo) {
    game = await getOrCreateDemo(gameId)
    cookies.set(wordleGameCacheKey(gameId), game.toString(), { path: "/" })
  } else {
    if (!user || !opponent) throw new Error("Invariant error")
    game = await getOrCreateLiveGame(gameId, user, opponent)
    cookies.set(wordleGameCacheKey(gameId), game.toString(), { path: "/" })
  }

  const resetCount = await getGameResetCount(gameId)

  const solved = game.won()
  const lost = game.answers.length >= 6 && !solved

  return new Response(
    JSON.stringify({
      gameId,
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
      solved,
      lost,
      resetCount,
    }),
  )
}
