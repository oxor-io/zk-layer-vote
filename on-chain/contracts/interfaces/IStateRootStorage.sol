// SPDX-License-Identifier:MIT
pragma solidity 0.8.20;

interface IStateRootStorage {
    struct ProposalStateRoot {
        bytes32 root;
        uint256 l2BlockNumber;
    }

    function stateRoots(uint256 chainId) external returns (ProposalStateRoot memory);
}
