// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { PuzzleMasterEoa, RematchCount, Balance, BuyIn, GameType, Player1, Player2, GameStatus, SubmissionWindow, GameStartTime, Solved, InviteExpiration, VoteRematch } from "../src/codegen/index.sol";
import { Status, Game } from "../src/codegen/common.sol";

contract DeadlinePuzzleSystemTest is MudTest {
  address puzzleMasterAddress = address(0x123);
  IWorld world = IWorld(worldAddress);

  function test_sets_expected_values_on_game_creation(uint32 submissionWindow, uint inviteExpiry) public {
    bytes32 gameId = world.games__newGame({
      gameType: Game.Wordle,
      submissionWindowSeconds: submissionWindow,
      inviteExpirationTimestamp: inviteExpiry,
      opponent: address(0x654),
      puzzleMaster: puzzleMasterAddress
    });

    assertEq(PuzzleMasterEoa.get(gameId), puzzleMasterAddress);
    assertEq(GameType.get(gameId), Game.Wordle);
  }
}
