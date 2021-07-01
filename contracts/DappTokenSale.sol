// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract DappTokenSale {

    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;
    
    constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    // Buy tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // require that value is equal to tokens
        // require that the contract has enough tokens
        // require that a transfer successful
        // Keep track of number token sold
        tokenSold += _numberOfTokens;
        // trigger sell event
    }
}