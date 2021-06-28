const DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', (accounts) => {
    it('sets the total supply upon deployment', () => {
        return DappToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply) => {
            assert.equal(totalSupply.toNumber(), 1000000, 'Total supply should be 1,000,000 at the beginning.')
            return tokenInstance.balanceOf(accounts[0]);
        }).then((adminBalance) => {
            assert.equal(adminBalance.toNumber(), 1000000, 'It should allocate all of the initial supply to admin.')
        });
    });
});