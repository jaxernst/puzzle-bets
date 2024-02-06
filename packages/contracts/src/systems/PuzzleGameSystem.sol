// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { Balance, BuyIn, GameType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Solved, InviteExpiration } from "../codegen/index.sol";
import { Status, Game } from "../codegen/common.sol";
import { IWorld } from "../codegen/world/IWorld.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";

contract PuzzleGameSystem is System {
  modifier playerOnly(bytes32 gameId) {
    require(_msgSender() == Player1.get(gameId) || _msgSender() == Player2.get(gameId), "Not game player");
    _;
  }

  function newGame(Game gameType, uint32 submissionWindowSeconds, uint inviteExpirationTimestamp) public payable {
    address creator = _msgSender();
    uint betAmount = _msgValue();

    bytes32 gameId = getUniqueEntity();
    GameType.set(gameId, gameType);
    GameStatus.set(gameId, Status.Pending);
    SubmissionWindow.set(gameId, submissionWindowSeconds);
    InviteExpiration.set(gameId, inviteExpirationTimestamp);

    Player1.set(gameId, creator);
    Balance.set(gameId, creator, betAmount);
    BuyIn.set(gameId, betAmount);
  }

  function joinGame(bytes32 gameId) public payable {
    Status status = GameStatus.get(gameId);
    uint betAmount = BuyIn.get(gameId);

    require(status == Status.Pending, "Game is not pending");
    require(InviteExpiration.get(gameId) > block.timestamp, "Invite expired");
    require(_msgValue() >= betAmount, "You must deposit to join the game");

    GameStatus.set(gameId, Status.Active);
    GameStartTime.set(gameId, block.timestamp);

    Balance.set(gameId, _msgSender(), betAmount);
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
      revert("Nothing to claim");
    }

    if (iSolved && !theySolved) {
      return _payWinner(gameId, me, them);
    }

    // Tie condition, each player can claim their deposit back
    _returnDeposit(gameId);
  }

  function _payWinner(bytes32 gameId, address winner, address loser) private {
    uint depositWinner = Balance.get(gameId, winner);
    uint depositLoser = Balance.get(gameId, loser);
    Balance.set(gameId, winner, 0);
    Balance.set(gameId, loser, 0);
    _transfer(winner, depositWinner + depositLoser);
  }

  function _returnDeposit(bytes32 gameId) private {
    address me = _msgSender();
    uint deposit = Balance.get(gameId, me);
    Balance.set(gameId, me, 0);
    _transfer(me, deposit);
  }

  function _transfer(address to, uint amount) private {
    IWorld(_world()).transferBalanceToAddress(ResourceIdLib.encode(RESOURCE_NAMESPACE, "games"), to, amount);
  }
}
