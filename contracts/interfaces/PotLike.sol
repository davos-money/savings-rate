// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface PotLike {
    function chi() external view returns (uint256);
    function rho() external view returns (uint256);
    function dsr() external view returns (uint256);
    function drip() external returns (uint256);
    function join(uint256) external;
    function exit(uint256) external;
}