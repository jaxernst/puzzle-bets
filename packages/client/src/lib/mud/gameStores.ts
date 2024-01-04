import { derived, writable } from "svelte/store";
import {
  GameStatus,
  type EvmAddress,
  type GameType,
  type Game,
} from "$lib/types";
import { mud, user } from "./mudStore";
import {
  type Entity,
  Has,
  HasValue,
  runQuery,
  getComponentValueStrict,
} from "@latticexyz/recs";

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
    return {
      game: getComponentValueStrict($mud.components.GameType, gameId),
      status: getComponentValueStrict($mud.components.GameStatus, gameId),
      p1: getComponentValueStrict($mud.components.Player1, gameId),
      p2: getComponentValueStrict($mud.components.Player2, gameId),
    };
  });
});
