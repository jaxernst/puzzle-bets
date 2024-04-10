// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

contract DeadlinePuzzleSystem is MudTest {
  IWorld world = IWorld(worldAddress);

  function test_create_game() public {}

  function test_cancel_created_game() public {}

  function test_join_game() public {}

  function test_submission_solution() public {}

  function test_rematching() public {}

  function test_claim() public {}
}
