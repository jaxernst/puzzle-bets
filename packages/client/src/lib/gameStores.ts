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
import { gameNumberToType, type Game } from "$lib/types";

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

    return {
      id: gameId,
      type: gameType,
      status: getComponentValueStrict($mud.components.GameStatus, gameId).value,
      p1: getComponentValueStrict($mud.components.Player1, gameId).value,
      p2: getComponentValue($mud.components.Player2, gameId)?.value,
    };
  });
});
