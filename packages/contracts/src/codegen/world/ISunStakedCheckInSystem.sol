// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

/**
 * @title ISunStakedCheckInSystem
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface ISunStakedCheckInSystem {
  function SunStakedCheckIn_enter(
    bytes32 wakeupObjective,
    uint32 numWeeks,
    uint8[] calldata challengeDays
  ) external returns (bytes32);

  function SunStakedCheckIn_confirmWakeup(bytes32 entity) external;

  function SunStakedCheckIn_complete(bytes32 entity) external;
}
