// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract DappTokenSale {

    address admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokenSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );
    
    constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    // Buy tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // require that the contract has enough tokens
        // require that a transfer successful
        tokenSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    // Multiply
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
}