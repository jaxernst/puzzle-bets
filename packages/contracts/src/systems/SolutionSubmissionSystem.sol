// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

/**
 * Solutions can only be submitted in active games before the deadline
 */
contract SolutionSubmissionSystem is System {
  function setSubmissionDeadline() public {}

  function submitSolution() public {}
}
