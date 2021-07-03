const DappTokenSale = artifacts.require("./DappTokenSale.sol");
const DappToken = artifacts.require("./DappToken.sol");

contract("DappTokenSale", (accounts) => {
  let tokenInstance;
  let admin = accounts[0];
  let buyer = accounts[1];
  let tokenPrice = 1000000000000000; // In WEI
  let tokensAvailable = 750000;
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

  it("facilitates token buying", async () => {
    let tokenSaleInstance = await DappTokenSale.deployed();
    let tokenInstance = await DappToken.deployed();

    // Provision 75% of all tokens to the sale contract
    await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {
      from: admin,
    });

    let numberOfTokens = 10;
    let receipt = await tokenSaleInstance.buyTokens(numberOfTokens, {
      from: buyer,
      value: numberOfTokens * tokenPrice,
    });

    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Sell", 'should be the "Sell" event');
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

    let tokenSoldAmount = await tokenSaleInstance.tokenSold();
    assert.equal(
      tokenSoldAmount.toNumber(),
      numberOfTokens,
      "increments the number of tokens sold."
    );

    let tokenBalance = await tokenInstance.balanceOf(tokenSaleInstance.address);
    assert.equal(tokenBalance.toNumber(), tokensAvailable - numberOfTokens);
    
    let buyerBalance = await tokenInstance.balanceOf(buyer);
    assert.equal(buyerBalance.toNumber(), numberOfTokens);

    //Try to buy tokens different from the ether value
    await tokenSaleInstance
      .buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "msg.value must equal to number in wei"
        );
      });

    await tokenSaleInstance
      .buyTokens(800000, {
        from: buyer,
        value: numberOfTokens * tokenPrice,
      })
      .then(assert.fail)
      .catch((error) => {
        assert(
          error.message.indexOf("revert") >= 0,
          "can not purchase more than available to the contract"
        );
      });
  });
});
