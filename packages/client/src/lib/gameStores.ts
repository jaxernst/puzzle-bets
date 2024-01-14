import { derived, writable } from "svelte/store";

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
    const gameType =
      gameNumberToType[
        getComponentValueStrict($mud.components.GameType, gameId).value
      ];

    const p1 = getComponentValueStrict($mud.components.Player1, gameId).value;
    const p2 = getComponentValue($mud.components.Player2, gameId)?.value;
    const status = getComponentValueStrict($mud.components.GameStatus, gameId)
      .value as GameStatus;

    const betAmount =
      getComponentValue(
        $mud.components.Deposit,
        encodeEntity(
          { gameId: "bytes32", player: "address" },
          { gameId: gameId as `0x${string}`, player: $user }
        )
      )?.value ?? 0n;

    const startTime = getComponentValue(
      $mud.components.GameStartTime,
      gameId
    )?.value;

    const submissionWindow = getComponentValueStrict(
      $mud.components.SubmissionWindow,
      gameId
    ).value;

    const inviteExpiration = getComponentValueStrict(
      $mud.components.InviteExpiration,
      gameId
    ).value;

    return {
      id: gameId,
      type: gameType,
      status,
      opponent: $user === p2 ? p1 : p2,
      betAmount,
      p1,
      p2,
      startTime,
      submissionWindow,
      inviteExpiration,
    };
  });
});
