// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_NAMESPACE } from "@latticexyz/world/src/worldResourceTypes.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { SolutionVerificationLib } from "../library/SolutionVerification.sol";
import { PuzzleMasterEoa, RematchCount, Balance, BuyIn, PuzzleType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Solved, InviteExpiration, VoteRematch } from "../codegen/index.sol";
import { Status, Puzzle } from "../codegen/common.sol";
import { IWorld } from "../codegen/world/IWorld.sol";
import { getUniqueEntity } from "@latticexyz/world-modules/src/modules/uniqueentity/getUniqueEntity.sol";
import { console } from "forge-std/console.sol";

/**
 * The System facillitates games between two players. Games are played in a syncronous fashion, where
 * the game starts for both players once the 2nd player joins. Both players will have the same amount of time to submit
 * a verified solution.
 *
 * Solution verification: When creating a game, a 'puzzle master' address can be provided. The puzzle master is an
 * address that can attest to the validity of a solution, and players must submit a signed message from the master
 * in order to verify their solution.
 */
contract DeadlinePuzzleSystem is System {
  modifier playerOnly(bytes32 gameId) {
    address sender = _msgSender();
    require(sender == Player1.get(gameId) || sender == Player2.get(gameId), "Not game player");
    _;
  }

  function newGame(
    Puzzle puzzleType,
    uint32 submissionWindowSeconds,
    uint inviteExpirationTimestamp,
    address opponent,
    address puzzleMaster
  ) public payable returns (bytes32) {
    address creator = _msgSender();
    uint betAmount = _msgValue();

    bytes32 gameId = getUniqueEntity();

    PuzzleType.set(gameId, puzzleType);
    GameStatus.set(gameId, Status.Pending);
    SubmissionWindow.set(gameId, submissionWindowSeconds);
    InviteExpiration.set(gameId, inviteExpirationTimestamp);

    Player1.set(gameId, creator);

    // Opponent can be set to 0 address (allows anyone to join)
    if (opponent != address(0)) {
      Player2.set(gameId, opponent);
    }

    Balance.set(gameId, creator, betAmount);
    BuyIn.set(gameId, betAmount);
    PuzzleMasterEoa.set(gameId, puzzleMaster);

    return gameId;
  }

  function joinGame(bytes32 gameId) public payable {
    Status status = GameStatus.get(gameId);
    address specifiedPlayer2 = Player2.get(gameId);
    if (specifiedPlayer2 != address(0)) {
      require(specifiedPlayer2 == _msgSender(), "You are not the specified player2");
    } else {
      Player2.set(gameId, _msgSender());
    }

    uint betAmount = BuyIn.get(gameId);

    require(status == Status.Pending, "Game is not pending");
    require(InviteExpiration.get(gameId) > block.timestamp, "Invite expired");
    require(_msgValue() >= betAmount, "Insufficient buy in");

    Balance.set(gameId, _msgSender(), betAmount);

    _startGame(gameId);
  }

  /**
   * Cancel a game request and withdraw funds
   * @notice Can only be called by the creator of the game while the game is
   * still in a pending state (second player has not joined)
   */
  function cancelPendingGame(bytes32 gameId) public {
    require(_msgSender() == Player1.get(gameId), "Only creator can cancel");
    require(GameStatus.get(gameId) == Status.Pending, "Game is not pending");
    GameStatus.set(gameId, Status.Inactive);
    _returnPlayerDeposit(gameId);
  }

  function submitSolution(bytes32 gameId, bytes memory puzzleMasterSignature) public playerOnly(gameId) {
    Status status = GameStatus.get(gameId);
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = GameStartTime.get(gameId);

    require(block.timestamp <= startTime + submissionWindow, "Submission window closed");
    require(status == Status.Active, "Game is not active");

    bool solved = SolutionVerificationLib.verifyPuzzleMasterSignature({
      gameId: gameId,
      player: _msgSender(),
      solutionIndex: 1,
      puzzleMaster: PuzzleMasterEoa.get(gameId),
      puzzleMasterSignature: puzzleMasterSignature
    });

    require(solved, "Puzzle master signature invalid");

    Solved.set(gameId, _msgSender(), true);
  }

  /**
   * Check outcome of the game and distribute funds to players.
   * @notice Players can claim funds after the deadline has passed, but may claim before
   * the deadline if both players have solved (tie game)
   */
  function claim(bytes32 gameId) public playerOnly(gameId) {
    address p1 = Player1.get(gameId);
    address p2 = Player2.get(gameId);

    if (p1 == _msgSender()) {
      _claim(gameId, p1, p2);
    } else {
      _claim(gameId, p2, p1);
    }
  }

  function voteRematch(bytes32 gameId) public playerOnly(gameId) {
    // Can't restart if either player has withdrawn
    Status status = GameStatus.get(gameId);
    require(status == Status.Active, "Game is not active");

    VoteRematch.set(gameId, _msgSender(), true);

    address p1 = Player1.get(gameId);
    address p2 = Player2.get(gameId);

    if (VoteRematch.get(gameId, p1) && VoteRematch.get(gameId, p2)) {
      Solved.set(gameId, p1, false);
      Solved.set(gameId, p2, false);
      VoteRematch.set(gameId, p1, false);
      VoteRematch.set(gameId, p2, false);
      RematchCount.set(gameId, RematchCount.get(gameId) + 1);
      _startGame(gameId);
    }
  }

  function _claim(bytes32 gameId, address me, address them) private {
    bool iSolved = Solved.get(gameId, me);
    bool theySolved = Solved.get(gameId, them);
    uint32 submissionWindow = SubmissionWindow.get(gameId);
    uint startTime = GameStartTime.get(gameId);

    // Can claim if deadline has passed or both players solved in a tie game
    bool canClaim = (block.timestamp > (startTime + submissionWindow)) || (iSolved && theySolved);
    require(canClaim, "Cannot claim");

    if (theySolved && !iSolved) {
      revert("Nothing to claim");
    }

    // Distribute funds to winner
    if (iSolved && !theySolved) {
      _payWinner(gameId, me, them);
      GameStatus.set(gameId, Status.Complete);
      return;
    }

    // Tie condition, each player can claim their deposit back
    _returnPlayerDeposit(gameId);
    // Mark game complete after either player withdraws
    GameStatus.set(gameId, Status.Complete);
  }

  function _startGame(bytes32 gameId) private {
    GameStatus.set(gameId, Status.Active);
    GameStartTime.set(gameId, block.timestamp);
  }

  function _payWinner(bytes32 gameId, address winner, address loser) private {
    uint depositWinner = Balance.get(gameId, winner);
    uint depositLoser = Balance.get(gameId, loser);
    Balance.set(gameId, winner, 0);
    Balance.set(gameId, loser, 0);
    _transfer(winner, depositWinner + depositLoser);
  }

  function _returnPlayerDeposit(bytes32 gameId) private {
    address me = _msgSender();
    uint deposit = Balance.get(gameId, me);
    Balance.set(gameId, me, 0);
    _transfer(me, deposit);
  }

  function _transfer(address to, uint amount) private {
    IWorld(_world()).transferBalanceToAddress(ResourceIdLib.encode(RESOURCE_NAMESPACE, "v1"), to, amount);
  }
}

/* Exploring other system designs for games


GameCreationSystem:
  new()
  join()


*/
