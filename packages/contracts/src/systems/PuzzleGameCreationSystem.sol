// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Puzzle, Status } from "../codegen/common.sol";
import { PuzzleType, GameStatus, GameStartTime, GameCreator } from "../codegen/index.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";

contract PuzzleGameCreationSystem is System {
  function createGame(Puzzle puzzleType) public {
    bytes32 gameId = getUniqueEntity();
    PuzzleType.set(gameId, puzzleType);
    GameStatus.set(gameId, Status.Pending);
    GameCreator.set(gameId, _msgSender());
  }
}
