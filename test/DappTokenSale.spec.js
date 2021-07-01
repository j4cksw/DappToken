const DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract('DappTokenSale', (accounts) => {
    let tokenInstance;
    let buyer = accounts[1];
    let tokenPrice = 1000000000000000; // In WEI
    let numberOfTokens;

    it('initializes the contract with the correct values', () => {
        return DappTokenSale.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.address;
        })
        .then((address) => {
            assert.notEqual(address, 0x0, 'has correct address');
            
            return tokenInstance.tokenContract();
        }).then((address) => {
            assert.notEqual(address, 0x0, 'has token contract address');
            
            return tokenInstance.tokenPrice();
        }).then((price) => {
            assert.equal(price, tokenPrice, 'token price is correct.')
        });
    });

    it('facilitates token buying', () => {
        return DappTokenSale.deployed().then((instance) => {
            tokenInstance = instance;
            numberOfTokens = 10;
            return tokenInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice});
        })
        .then((receipt) => {
            return tokenInstance.tokenSold();
        })
        .then((amount) => {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold.');
        })
    });
});