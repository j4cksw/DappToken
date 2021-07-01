const DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract('DappYokenSale', (accounts) => {
    var tokenInstance;
    let tokenPrice = 1000000000000000; // In WEI
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
});