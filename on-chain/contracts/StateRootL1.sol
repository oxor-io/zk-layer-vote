//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

interface IStateRootL1 {
    error StateRootL1__sameChainid();
    error StateRootL1__emptyRoot();

    event RootUpdated(uint256 indexed chainId, bytes32 root);
}

contract StateRootL1 is IStateRootL1, Ownable {
    constructor(address oracle) Ownable(oracle) {}

    mapping(uint256 chainId => mapping(uint256 blockNumber => bytes32 stateRoot)) public stateRoots;

    function addStateRoot(uint256 chainId, bytes32 stateRoot, uint256 blockNumber) public onlyOwner {
        if (chainId == block.chainid) {
            revert StateRootL1__sameChainid();
        }

        if (stateRoot == 0) {
            revert StateRootL1__emptyRoot();
        }

        stateRoots[chainId][blockNumber] = stateRoot;
        emit RootUpdated(chainId, stateRoot);
    }
}
