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
  type EvmAddress,
  type GameType,
} from "$lib/types";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import type { SetupNetworkResult } from "./mud/setupNetwork";
import { timeRemaining, intToEntity } from "./util";

export const userGames = derived([mud, user], ([$mud, $user]) => {
  if (!$mud?.ready || !$user) return [];

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
 **/
export function liveGameStatus(gameId: Entity) {
  const store = writable<LiveStatus | null>(null);

  // Decrement timers and mark game as complete when time runs out
  const updateStatusTimers = (onGameFinalized: () => void) => {
    const { inviteExpiration, startTime, submissionWindow } = gameIdToGame(
      gameId,
      get(mud).components
    );

    store.update((g) => {
      if (!g) return g;

      if (g.status === GameStatus.Pending) {
        return { ...g, inviteTimeLeft: timeRemaining(inviteExpiration) };
      } else if (g.status === GameStatus.Active) {
        if (!startTime) return g;

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
  let timer: NodeJS.Timeout;

  const startTimers = () => {
    updateStatusTimers(() => {});

    timer = setInterval(() => {
      updateStatusTimers(() => {
        // On game finalized callback
        timersStarted = false;
        clearInterval(timer);
      });
    }, 1000);

    timersStarted = true;
  };

  let gameStartTime: bigint | null = null;

  // Listen for status updates to the onchain game state
  mud.subscribe(($mud) => {
    if (!$mud?.ready) return undefined;

    const game = gameIdToGame(gameId, $mud.components);

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
      startTimers();
    }

    const gameStartTimeChanged =
      gameStartTime !== null && game.startTime !== gameStartTime;

    // If the game start time changes (when a rematch occurs), reset timers
    if (gameStartTimeChanged && timersStarted) {
      clearInterval(timer);
      startTimers();
    }

    // Listen for a game rematch to occur. When it does, restart the timers
    gameStartTime = game.startTime ?? null;
  });

  return store;
}

export const userArchivedGames = (() => {
  const store = writable<Entity[]>([]);

  user.subscribe(async ($user) => {
    if (!$user) return;

    const res = await fetch(`/api/game-settings/${$user}/archived`);
    if (res.ok) {
      const data = (await res.json()) as number[];
      store.set(data.map((g) => intToEntity(g, true)!));
    }
  });

  const setArchivedState = async (gameId: Entity, archiveState: boolean) => {
    const $user = get(user);
    if (!$user) return;

    const res = await fetch(`/api/game-settings/${$user}/update-archived`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: parseInt(gameId, 16),
        archived: archiveState,
      }),
    });

    if (res.ok) {
      store.update((games) => {
        if (archiveState) {
          return [...games, gameId];
        } else {
          return games.filter((g) => g !== gameId);
        }
      });
    }
  };

  return {
    ...store,
    setArchivedState,
  };
})();

export const gameInviteUrls = (() => {
  const urls = writable<Record<number, string>>("");

  const makeInviteUrl = (
    gameType: GameType,
    gameId: number,
    gameWagerUsd?: number,
    inviteName?: string | null
  ) => {
    const urlParams = new URLSearchParams({
      gameType: gameType,
    });

    if (inviteName) {
      urlParams.set("from", inviteName.split(" ").join("_"));
    }

    if (gameWagerUsd) {
      urlParams.set("valUsd", gameWagerUsd.toFixed(2));
    }

    return `${window.location.origin}/join/${gameId}?${urlParams.toString()}`;
  };

  return {
    subscribe: urls.subscribe,
    create: (
      gameType: GameType,
      gameId: number,
      gameWagerUsd?: number,
      inviteName?: string | null
    ) => {
      const url = makeInviteUrl(gameType, gameId, gameWagerUsd, inviteName);
      urls.update((urls) => {
        return {
          ...urls,
          [gameId]: url,
        };
      });

      return url;
    },
  };
})();

// Util //

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

  const p1GameKey = encodeEntity(
    { gameId: "bytes32", player: "address" },
    { gameId: gameId as `0x${string}`, player: p1 as `0x${string}` }
  );

  const p2GameKey =
    p2 &&
    encodeEntity(
      { gameId: "bytes32", player: "address" },
      { gameId: gameId as `0x${string}`, player: p2 as `0x${string}` }
    );

  const p1Balance =
    getComponentValue(mudComponents.Balance, p1GameKey)?.value ?? 0n;

  const p2Balance =
    (p2GameKey && getComponentValue(mudComponents.Balance, p2GameKey)?.value) ??
    0n;

  const p1Rematch = getComponentValue(
    mudComponents.VoteRematch,
    p1GameKey
  )?.value;

  const p2Rematch =
    p2GameKey && getComponentValue(mudComponents.VoteRematch, p2GameKey)?.value;

  const rematchCount =
    getComponentValue(mudComponents.RematchCount, gameId)?.value ?? 0;

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
    p1Rematch,
    p2Rematch,
    rematchCount,
  };
};
