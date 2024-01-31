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
  return (gameId: Entity, opts?: { expectStarted?: boolean }) => {
    if (!$mud?.ready) return undefined;
    if (!getComponentValue($mud.components.GameType, gameId)) return undefined;

    const game = gameIdToGame(gameId, $mud.components);

    if (opts?.expectStarted && !game.startTime) {
      throw new Error("Game not started");
    }

    return game;
  };
});

export const userSolvedGame = derived(mud, ($mud) => {
  return (gameId: Entity, user: EvmAddress | undefined) => {
    if (!$mud?.ready || !user) return false;

    const solved = getComponentValue(
      $mud.components.Solved,
      encodeEntity(
        { gameId: "bytes32", player: "address" },
        { gameId: gameId as `0x${string}`, player: user }
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
export function liveGameStatus(gameId: Entity) {
  const store = writable<LiveStatus | null>(null);

  // Decrement timers and mark game as complete when time runs out
  const updateStatusTimers = (
    { inviteExpiration, submissionWindow, startTime }: Game,
    onGameFinalized: () => void
  ) => {
    store.update((g) => {
      if (!g) return g;

      if (g.status === GameStatus.Pending) {
        return { ...g, inviteTimeLeft: timeRemaining(inviteExpiration) };
      } else if (g.status === GameStatus.Active) {
        if (!startTime) throw new Error("Invariant error");

        const timeLeft = timeRemaining(Number(startTime) + submissionWindow);

        if (timeLeft === 0) {
          onGameFinalized();
          return { ...g, submissionTimeLeft: 0 };
        }

        return { ...g, submissionTimeLeft: timeLeft };
      } else if (g.status === GameStatus.Complete) {
        onGameFinalized();
      }

      return g;
    });
  };

  let timersStarted = false;

  // Listen for status updates to the onchain game state
  const unsubscribe = mud.subscribe(($mud) => {
    if (!$mud?.ready) return undefined;

    const game = gameIdToGame(gameId, $mud.components);

    const startTimers = (game: Game) => {
      updateStatusTimers(game, () => {});
      const clearTimer = setInterval(() => {
        updateStatusTimers(game, () => {
          clearInterval(clearTimer);
          unsubscribe();
        });
      }, 1000);
    };

    store.update((state) => {
      if (!state) {
        return {
          gameId,
          status: game.status,
          submissionTimeLeft: undefined,
          inviteTimeLeft: undefined,
        };
      } else {
        return { ...state, status: game.status };
      }
    });

    if (!timersStarted) {
      startTimers(game);
    }
  });

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

  const buyInAmount =
    getComponentValue(mudComponents.BuyIn, gameId)?.value ?? 0n;

  const p1Balance =
    getComponentValue(
      mudComponents.Balance,
      encodeEntity(
        { gameId: "bytes32", player: "address" },
        { gameId: gameId as `0x${string}`, player: p1 as `0x${string}` }
      )
    )?.value ?? 0n;

  const p2Balance =
    (p2 &&
      getComponentValue(
        mudComponents.Balance,
        encodeEntity(
          { gameId: "bytes32", player: "address" },
          { gameId: gameId as `0x${string}`, player: p2 as `0x${string}` }
        )
      )?.value) ??
    0n;

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
    buyInAmount,
    p1Balance,
    p2Balance,
    startTime,
    submissionWindow,
    inviteExpiration,
  };
};
