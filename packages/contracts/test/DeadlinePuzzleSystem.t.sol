// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Puzzle, Status } from "../src/codegen/common.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { PuzzleMasterEoa, RematchCount, Balance, BuyIn, PuzzleType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Solved, InviteExpiration, VoteRematch } from "../src/codegen/index.sol";

contract DeadlinePuzzleSystemTest is MudTest {
  function test_newGame_GameVariablesAreSetOnCreation() public {
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: address(0x123),
      puzzleMaster: address(0x456)
    });

    assertEq(Player1.get(gameId), address(this));
    assertEq(Player2.get(gameId), address(0x123));
    assertEq(PuzzleMasterEoa.get(gameId), address(0x456));
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Pending));
    assertEq(BuyIn.get(gameId), 1 ether);
    assertEq(Balance.get(gameId, address(this)), 1 ether);
    assertEq(SubmissionWindow.get(gameId), 1);
    assertEq(InviteExpiration.get(gameId), block.timestamp + 100);
  }

  function test_joinGame_JoinGameRequiresBuyInDeposit() public {
    address opponent = address(0x123);
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: opponent,
      puzzleMaster: address(0x456)
    });

    vm.startPrank(opponent);
    vm.deal(opponent, 1 ether);
    vm.expectRevert("Insufficient buy in");
    IWorld(worldAddress).v1__joinGame(gameId);
    assertEq(Balance.get(gameId, opponent), 0);

    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);
    assertEq(Balance.get(gameId, opponent), 1 ether);
  }

  function test_joinGame_OnlySpecifiedOpponentCanJoinGame() public {
    address opponent = address(0x123);
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: opponent,
      puzzleMaster: address(0x456)
    });

    vm.prank(address(0x999));
    vm.expectRevert("You are not the specified player2");
    IWorld(worldAddress).v1__joinGame(gameId);

    vm.prank(opponent);
    IWorld(worldAddress).v1__joinGame(gameId);
  }

  function test_joinGame_CancelledGameCannotBeJoined() public {
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: address(0x123),
      puzzleMaster: address(0x456)
    });

    IWorld(worldAddress).v1__cancelPendingGame(gameId);

    vm.prank(address(0x123));
    vm.expectRevert();
    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);
  }

  function test_joinGame_GameIsStartedWhenOpponentJoins() public {
    bytes32 gameId = IWorld(worldAddress).v1__newGame({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: address(0),
      puzzleMaster: address(0x456)
    });

    vm.prank(address(0x999));
    IWorld(worldAddress).v1__joinGame(gameId);
    assertEq(Player2.get(gameId), address(0x999));
    assertEq(uint(GameStatus.get(gameId)), uint(Status.Active));
  }

  function test_cancelPendingGame_BuyInReturnedWhenCreatorCancelsGame() public {
    uint startingBalance = address(this).balance;
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: address(0x123),
      puzzleMaster: address(0x456)
    });

    assertEq(address(this).balance, startingBalance - 1 ether);
    IWorld(worldAddress).v1__cancelPendingGame(gameId);
    assertEq(address(this).balance, startingBalance);
  }

  function test_cancelPendingGame_GameCannotBeCancelledOnceStarted() public {
    bytes32 gameId = IWorld(worldAddress).v1__newGame{ value: 1 ether }({
      puzzleType: Puzzle.Wordle,
      submissionWindowSeconds: 1,
      inviteExpirationTimestamp: block.timestamp + 100,
      opponent: address(0),
      puzzleMaster: address(0x456)
    });

    IWorld(worldAddress).v1__joinGame{ value: 1 ether }(gameId);

    vm.expectRevert("Game is not pending");
    IWorld(worldAddress).v1__cancelPendingGame(gameId);
  }

  function test_submission_solution() public {}

  function test_rematching() public {}

  function test_claim() public {}

  receive() external payable {}
}
