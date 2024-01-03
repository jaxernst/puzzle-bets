// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Counter } from "../codegen/index.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";

contract PuzzleGameSystem is System {
  function newGame(uint32 submissionWindow) public payable returns (uint32) {
    address creator = _msgSender();
    uint betAmount = msg.value;

    bytes32 gameId = getUniqueEntity();

    Deposit.set(gameId, creator, betAmount);
    Player.set(gameId, creator, true);
    GameStatus.set(gameId, Status.Pending);
    SubmissionWindow.set(gameId, duration);
  }

  function joinGame(bytes32 gameId) public {
    Status status = GameStatus.get(gameId);
    uint betAmount = Deposit.get(gameId, _msgSender());
    require(status == Status.Pending, "Game is not pending");
    require(_msgValue() >= depositAmount, "You must deposit to join the game");

    Deposit.set(gameId, _msgSender(), betAmount);
    Player.set(gameId, _msgSender(), true);
    GameStatus.set(gameId, Status.Active);
    StartTime.set(gameId, block.timestamp);
  }

  function submitSolution() public {
    Status status = GameStatus.get(gameId);
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = StartTime.get(gameId);

    require(Player.get(gameId, _msgSender()), "You are not a player");
    require(status == Status.Active, "Game is not active");
    require(block.timestamp <= startTime + submissionWindow, "Submission window closed");

    Solved.set(gameId, _msgSender(), true);
  }

  function claim() public {
    Status status = GameStatus.get(gameId);
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = StartTime.get(gameId);

    require(status == Status.Active, "Game is not active");
    require(block.timestamp > startTime + submissionWindow, "Submission window still open");
  }
}
