// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

/**
 * Provides the ability for games to be restarted if all players vote for a rematch
 *
 * Games can only be rematched if all players have not withdrawn
 */
contract RematchSystem is System {
  function setRematchable() public {}

  function voteRematch() public {}

  function restart() public {}
}
