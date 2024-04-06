// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

/**
 * Bet systems define the logic for deposits and bet fund distribution.
 * This include determining who 'won' the bet, or who gets what allocation
 * of the bet once the game has concluded
 */

contract SolePlayerToSolveBetSystem is System {
  function applyBetSystem() public {}

  function deposit() public {}

  function claim() public {}
}
