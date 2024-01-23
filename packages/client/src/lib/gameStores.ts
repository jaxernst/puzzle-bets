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
import { GameStatus, gameNumberToType, type Game } from "$lib/types";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import type { SetupNetworkResult } from "./mud/setupNetwork";

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
  return (gameId: Entity) => gameIdToGame(gameId, $mud.components);
});

const gameIdToGame = (
  gameId: Entity,
  mudComponents: SetupNetworkResult["components"]
) => {
  const gameType =
    gameNumberToType[
      getComponentValueStrict(mudComponents.GameType, gameId).value
    ];

  const p1 = getComponentValueStrict(mudComponents.Player1, gameId).value;
  const p2 = getComponentValue(mudComponents.Player2, gameId)?.value;
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
    betAmount,
    p1,
    p2,
    startTime,
    submissionWindow,
    inviteExpiration,
  };
};
