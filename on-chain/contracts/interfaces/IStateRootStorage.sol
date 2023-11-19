// SPDX-License-Identifier:MIT
pragma solidity 0.8.20;

interface IStateRootStorage {
    function stateRoots(uint256 chainId, uint256 blockNumber) external view returns (bytes32 stateRoot);
}
