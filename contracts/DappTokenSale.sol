// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract DappTokenSale {

    address admin;

    DappToken public tokenContract;
    
    constructor(DappToken _tokenContract) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        // Token price
    }
}