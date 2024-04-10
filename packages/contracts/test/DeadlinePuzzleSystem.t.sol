// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Puzzle, Status } from "../src/codegen/common.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { PuzzleMasterEoa, RematchCount, Balance, BuyIn, PuzzleType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Solved, InviteExpiration, VoteRematch } from "../src/codegen/index.sol";

contract DeadlinePuzzleSystem is MudTest {
  function test_game_creation() public {
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

  function test_cancel_created_game() public {}

  function test_join_game() public {}

  function test_submission_solution() public {}

  function test_rematching() public {}

  function test_claim() public {}
}
