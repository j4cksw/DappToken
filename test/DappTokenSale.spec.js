const DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract('DappYokenSale', (accounts) => {
    var tokenInstance;

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
        });
    })
})