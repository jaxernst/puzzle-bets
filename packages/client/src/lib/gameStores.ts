import { derived, get, writable } from "svelte/store";

import { mud, user } from "./mud/mudStore";
import {
  Has,
  HasValue,
  runQuery,
  getComponentValueStrict,
  getComponentValue,
  type Entity,
} from "@latticexyz/recs";
import {
  GameStatus,
  gameNumberToType,
  type Game,
  type StartedGame,
  type EvmAddress,
} from "$lib/types";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import type { SetupNetworkResult } from "./mud/setupNetwork";
import { systemTimestamp, timeRemaining } from "./util";

export const userGames = derived([mud, user], ([$mud, $user]) => {
  if (!$mud || !$mud.ready || !$user) return [];

  const p1Games = runQuery([
    Has($mud.components.GameStatus),
    HasValue($mud.components.Player1, { value: $user }),
  ]);

  const p2Games = runQuery([
    Has($mud.components.GameStatus),
    HasValue($mud.components.Player2, { value: $user }),
  ]);

  return Array.from([...p1Games, ...p2Games]).map((gameId) => {
    const game = gameIdToGame(gameId, $mud.components);
    return {
      ...game,
      opponent: $user === game.p1 ? game.p2 : game.p1,
    };
  });
});

export const getGame = derived(mud, ($mud) => {
  return <T extends boolean>(
    gameId: Entity,
    opts?: { expectStarted?: boolean }
  ) => {
    if (!$mud?.ready) return undefined;
    if (!getComponentValue($mud.components.GameType, gameId)) return undefined;

    const game = gameIdToGame(gameId, $mud.components);

    if (opts?.expectStarted && !game.startTime) {
      throw new Error("Game not started");
    }

    return game;
  };
});

export const userSolvedGame = derived([mud, user], ([$mud, $user]) => {
  return (gameId: Entity) => {
    if (!$mud?.ready || !$user) return false;

    const solved = getComponentValue(
      $mud.components.Solved,
      encodeEntity(
        { gameId: "bytes32", player: "address" },
        { gameId: gameId as `0x${string}`, player: $user }
      )
    );

    return solved?.value ?? false;
  };
});

export type LiveStatus = {
  gameId: Entity;
  status: GameStatus;
  submissionTimeLeft?: number;
  inviteTimeLeft?: number;
};

/**
 * Get an auto-updating game status store with countdown timers for invite deadlines
 * and puzzle submission deadlines
 
 * @notice Game status will auto update after the submission window
 * closes, even though the smart contract state will not update until either
 * user claims the pot
 **/
export function liveGameStatus(initialGameState: Game) {
  const gameId = initialGameState.id;
  const submissionWindow = initialGameState.submissionWindow;
  const gameInviteExpiration = initialGameState.inviteExpiration;

  // Can be undefined, but will be set once the game starts
  let gameStartTime = initialGameState.startTime;

  const store = writable<LiveStatus>({
    gameId,
    status: initialGameState.status,
    submissionTimeLeft: undefined,
    inviteTimeLeft: undefined,
  });

  // Listen for status updates to the onchain game state
  const unsubscribe = mud.subscribe(($mud) => {
    if (!$mud?.ready) return undefined;

    const game = gameIdToGame(gameId, $mud.components);
    gameStartTime = game.startTime;
    store.update((g) => ({ ...g, status: game.status }));
  });

  // Decrement timers and mark game as complete when time runs out
  const clearTimer = setInterval(() => {
    store.update((g) => {
      if (g.status === GameStatus.Pending) {
        return { ...g, inviteTimeLeft: timeRemaining(gameInviteExpiration) };
      } else if (g.status === GameStatus.Active) {
        if (!gameStartTime) throw new Error("Invariant error");

        const timeLeft = timeRemaining(
          Number(gameStartTime) + submissionWindow
        );

        if (timeLeft === 0) {
          // Final game state, clear all subscriptions + timers
          unsubscribe();
          clearInterval(clearTimer);
          return { ...g, submissionTimeLeft: 0, status: GameStatus.Complete };
        }

        return { ...g, submissionTimeLeft: timeLeft };
      }
      return g;
    });
  }, 1000);

  return store;
}

const gameIdToGame = (
  gameId: Entity,
  mudComponents: SetupNetworkResult["components"]
) => {
  const gameType =
    gameNumberToType[
      getComponentValueStrict(mudComponents.GameType, gameId).value
    ];

  const p1 = getComponentValueStrict(mudComponents.Player1, gameId)
    .value as EvmAddress;

  const p2 = getComponentValue(mudComponents.Player2, gameId)?.value as
    | EvmAddress
    | undefined;

  const status = getComponentValueStrict(mudComponents.GameStatus, gameId)
    .value as GameStatus;

  const betAmount =
    getComponentValue(
      mudComponents.Deposit,
      encodeEntity(
        { gameId: "bytes32", player: "address" },
        { gameId: gameId as `0x${string}`, player: p1 as `0x${string}` }
      )
    )?.value ?? 0n;

  const startTime = getComponentValue(
    mudComponents.GameStartTime,
    gameId
  )?.value;

  const submissionWindow = getComponentValueStrict(
    mudComponents.SubmissionWindow,
    gameId
  ).value;

  const inviteExpiration = getComponentValueStrict(
    mudComponents.InviteExpiration,
    gameId
  ).value;

  return {
    id: gameId,
    type: gameType,
    status,
    p1,
    p2,
    betAmount,
    startTime,
    submissionWindow,
    inviteExpiration,
  };
};
