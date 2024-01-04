import { derived, writable } from "svelte/store";
import {
  GameStatus,
  type EvmAddress,
  type GameType,
  type Game,
} from "$lib/types";
import { mud, user } from "./mudStore";
import { type Entity, Has, HasValue, runQuery } from "@latticexyz/recs";

export const userGames = derived([mud, user], ([$mud, $user]) => {
  if (!$mud || !$mud.ready || !$user) return new Set<Entity>();

  return runQuery([
    Has($mud.components.GameStatus),
    HasValue($mud.components.GamePlayer, { value: $user }),
  ]);
});
