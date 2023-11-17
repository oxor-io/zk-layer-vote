//SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract DelegateL2 {

    mapping(address => mapping(address => mapping(address => uint256))) public delegated;

    event Delegated(
        address from,
        address to,
        uint256 amount
    );

    event MoveDelegated(
        address from,
        address to,
        uint256 amount
    );

    function delegate(
        ERC20 token,
        address to,
        uint256 amount
    ) public {
        token.transferFrom(msg.sender,  address(this), amount);

        delegated[address(token)][msg.sender][to] += amount;

        emit Delegated(msg.sender, to, amount);
    }

    function moveDelegate(
        ERC20 token,
        address to,
        uint256 amount
    ) public {
        delegated[address(token)][msg.sender][to] -= amount;

        emit MoveDelegated(msg.sender, to, amount);
    }
}
