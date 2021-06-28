// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DappToken {

    uint256 public totalSupply;

    constructor(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
    }
}