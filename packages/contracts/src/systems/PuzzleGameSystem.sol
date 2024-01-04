// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Deposit, GameType, GamePlayer, GameStatus, SubmissionWindow, GameStartTime, Solved, OtherPlayer } from "../codegen/index.sol";
import { Status, Game } from "../codegen/common.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";

contract PuzzleGameSystem is System {
  function newGame(Game gameType, uint32 submissionWindow) public payable returns (uint32) {
    address creator = _msgSender();
    uint betAmount = msg.value;

    bytes32 gameId = getUniqueEntity();

    GameType.set(gameId, gameType);
    GameStatus.set(gameId, Status.Pending);
    SubmissionWindow.set(gameId, submissionWindow);

    GamePlayer.set(gameId, creator);
    Deposit.set(gameId, creator, betAmount);
  }

  function joinGame(bytes32 gameId, address otherPlayer) public {
    Status status = GameStatus.get(gameId);
    uint betAmount = Deposit.get(gameId, _msgSender());

    require(GamePlayer.get(gameId, otherPlayer), "Other player invalid");
    require(status == Status.Pending, "Game is not pending");
    require(_msgValue() >= betAmount, "You must deposit to join the game");

    GameStatus.set(gameId, Status.Active);
    GameStartTime.set(gameId, block.timestamp);

    Deposit.set(gameId, _msgSender(), betAmount);
    GamePlayer.set(gameId, _msgSender());

    // Set player lookup indices
    OtherPlayer.set(gameId, _msgSender(), otherPlayer);
    OtherPlayer.set(gameId, otherPlayer, _msgSender());
  }

  function submitSolution(bytes32 gameId) public {
    Status status = GameStatus.get(gameId);
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = GameStartTime.get(gameId);

    require(GamePlayer.get(gameId, _msgSender()), "You are not a GamePlayer");
    require(status == Status.Active, "Game is not active");
    require(block.timestamp <= startTime + submissionWindow, "Submission window closed");

    Solved.set(gameId, _msgSender(), true);
  }

  function claim(bytes32 gameId) public {
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = GameStartTime.get(gameId);
    if (block.timestamp > startTime + submissionWindow) {
      GameStatus.set(gameId, Status.Complete);
    }

    require(GameStatus.get(gameId) == Status.Complete, "Game is not active");
    require(block.timestamp > startTime + submissionWindow, "Submission window still open");

    address me = _msgSender();
    address otherPlayer = OtherPlayer.get(gameId, me);

    bool iSolved = Solved.get(gameId, me);
    bool theySolved = Solved.get(gameId, OtherPlayer.get(gameId, me));

    // Distribute funds
    if (theySolved && !iSolved) {
      return _payWinner(gameId, otherPlayer, me);
    }

    if (iSolved && !theySolved) {
      return _payWinner(gameId, me, otherPlayer);
    }

    // Tie condition, each player can claim their deposit back
    _returnDeposit(gameId);
  }

  function _payWinner(bytes32 gameId, address winner, address loser) private {
    uint depositWinner = Deposit.get(gameId, winner);
    uint depositLoser = Deposit.get(gameId, loser);
    Deposit.set(gameId, winner, 0);
    Deposit.set(gameId, loser, 0);
    payable(winner).transfer(depositLoser + depositWinner);
  }

  function _returnDeposit(bytes32 gameId) private {
    address me = _msgSender();
    uint deposit = Deposit.get(gameId, me);
    Deposit.set(gameId, me, 0);
    payable(me).transfer(deposit);
  }
}
