// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Deposit, GameType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Solved, InviteExpiration } from "../codegen/index.sol";
import { Status, Game } from "../codegen/common.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";

contract PuzzleGameSystem is System {
  modifier playerOnly(bytes32 gameId) {
    require(_msgSender() == Player1.get(gameId) || _msgSender() == Player2.get(gameId), "Not game player");
    _;
  }

  function newGame(Game gameType, uint32 submissionWindowSeconds, uint inviteExpirationTimestamp) public payable {
    address creator = _msgSender();
    uint betAmount = msg.value;

    bytes32 gameId = getUniqueEntity();
    GameType.set(gameId, gameType);
    GameStatus.set(gameId, Status.Pending);
    SubmissionWindow.set(gameId, submissionWindowSeconds);
    InviteExpiration.set(gameId, inviteExpirationTimestamp);

    Player1.set(gameId, creator);
    Deposit.set(gameId, creator, betAmount);
  }

  function joinGame(bytes32 gameId) public payable {
    Status status = GameStatus.get(gameId);
    uint betAmount = Deposit.get(gameId, _msgSender());

    require(status == Status.Pending, "Game is not pending");
    require(InviteExpiration.get(gameId) > block.timestamp, "Invite expired");
    require(_msgValue() >= betAmount, "You must deposit to join the game");

    GameStatus.set(gameId, Status.Active);
    GameStartTime.set(gameId, block.timestamp);

    Deposit.set(gameId, _msgSender(), betAmount);
    Player2.set(gameId, _msgSender());
  }

  function submitSolution(bytes32 gameId) public playerOnly(gameId) {
    Status status = GameStatus.get(gameId);
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = GameStartTime.get(gameId);

    require(status == Status.Active, "Game is not active");
    require(block.timestamp <= startTime + submissionWindow, "Submission window closed");

    Solved.set(gameId, _msgSender(), true);
  }

  function claim(bytes32 gameId) public playerOnly(gameId) {
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = GameStartTime.get(gameId);

    // Set game as complete only after the submissionWindow closes
    if (block.timestamp > startTime + submissionWindow) {
      GameStatus.set(gameId, Status.Complete);
    }

    require(GameStatus.get(gameId) == Status.Complete, "Game is not active");

    address p1 = Player1.get(gameId);
    address p2 = Player2.get(gameId);
    if (p1 == _msgSender()) {
      _claim(gameId, p1, p2);
    } else {
      _claim(gameId, p2, p1);
    }
  }

  function _claim(bytes32 gameId, address me, address them) private {
    bool iSolved = Solved.get(gameId, me);
    bool theySolved = Solved.get(gameId, them);

    // Distribute funds to winner
    if (theySolved && !iSolved) {
      return _payWinner(gameId, them, me);
    }

    if (iSolved && !theySolved) {
      return _payWinner(gameId, me, them);
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
