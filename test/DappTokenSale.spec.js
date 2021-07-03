const DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract("DappTokenSale", (accounts) => {
  let tokenInstance;
  let buyer = accounts[1];
  let tokenPrice = 1000000000000000; // In WEI
  let numberOfTokens;

  it("initializes the contract with the correct values", () => {
    return DappTokenSale.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.address;
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has correct address");

        return tokenInstance.tokenContract();
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has token contract address");

        return tokenInstance.tokenPrice();
      })
      .then((price) => {
        assert.equal(price, tokenPrice, "token price is correct.");
      });
  });

  it("facilitates token buying", () => {
    return DappTokenSale.deployed()
      .then((instance) => {
        tokenInstance = instance;
        numberOfTokens = 10;
        return tokenInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice,
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Sell",
          'should be the "Sell" event'
        );
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account that purchased the tokens."
        );
        assert.equal(
          receipt.logs[0].args._amount,
          numberOfTokens,
          "logs the number of tokens purchased."
        );

        return tokenInstance.tokenSold();
      })
      .then((amount) => {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increments the number of tokens sold."
        );

        //Try to buy tokens different from the ether value
        return tokenInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must equal to number in wei"
        );
      });
  });
});
