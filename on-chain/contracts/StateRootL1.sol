//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract StateRootL1 {

    struct StateRoot {
        bytes32 root;
        uint256 l2BlockNumber;
    }

    mapping(uint256 => StateRoot) public stateRoots;

    event RootAdded(
        uint256 chainId,
        bytes32 root
    );

    function addStateRoot(
        uint256 chainId,
        bytes32 stateRoot,
        uint256 blockNumber
    ) public {
        stateRoots[chainId] = StateRoot(stateRoot, blockNumber);

        emit RootAdded(chainId, stateRoot);
    }
}
