// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { getKeysWithValue } from "@latticexyz/world-modules/src/modules/keyswithvalue/getKeysWithValue.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { AlarmSchedule } from "../src/codegen/index.sol";

contract AlarmChallengeTest is MudTest {
  /*function test_EnterDailyCheckIn() public {
    bytes32 entity = IWorld(worldAddress).newObjective(0, 0);

    uint8[] memory challengeDays = new uint8[](3);
    challengeDays[0] = 1;
    challengeDays[1] = 5;
    challengeDays[2] = 6;

    bytes32 challengeId = IWorld(worldAddress).SunStakedCheckIn_enter(entity, 1, challengeDays);

    // Check that entering the challenge creates a schedule
    assertTrue(AlarmSchedule.getActivationTimestamp(challengeId) > 0);
  }

  function testFail_DailyCheckIn() public {
    bytes32 entity = IWorld(worldAddress).newObjective(0, 0);

    uint8[] memory challengeDays = new uint8[](1);
    challengeDays[0] = 1;

    bytes32 challengeId = IWorld(worldAddress).SunStakedCheckIn_enter(entity, 1, challengeDays);
    IWorld(worldAddress).SunStakedCheckIn_confirmWakeup(challengeId);
  }*/
}
