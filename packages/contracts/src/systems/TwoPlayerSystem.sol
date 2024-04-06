// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { GameCreator, TwoPlayerGame, Players } from "../codegen/index.sol";

contract CreatorSystem is System {
  modifier onlyGameCreator(bytes32 gameId) {
    require(GameCreator.get(gameId) == _msgSender(), "Only game creator");
    _;
  }
}

contract TwoPlayerSystem is CreatorSystem {
  function makeTwoPlayer(bytes32 gameId, address opponent) public onlyGameCreator(gameId) {
    TwoPlayerGame.set(gameId, true);
    Players.set(gameId, _msgSender(), true);

    if (opponent != address(0)) {
      Players.set(gameId, opponent, true);
    }
  }

  function join(bytes32 gameId) public {}
}
